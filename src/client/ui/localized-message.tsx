import { createComponent, lazy, mergeProps, Suspense, type JSX } from "solid-js";
import type { ParaglideMessage } from "@inlang/paraglide-js-solid";
import { links_openInNewTab } from "@/client/lib/links";

const LazyMessage = lazy(async () => ({
  default: (await import("@inlang/paraglide-js-solid")).ParaglideMessage,
}));

type Message = Parameters<typeof ParaglideMessage>[0]["message"];
type AdapterProps<TMessage extends Message> = Parameters<typeof ParaglideMessage<TMessage>>[0];

const defaultMarkup = {
  "external-link": (props: { children?: JSX.Element; options: { to: string } }) => (
    <a href={props.options.to} {...links_openInNewTab}>
      {props.children}
    </a>
  ),
};

type CustomMarkup<TMarkup> = Omit<TMarkup, keyof typeof defaultMarkup> &
  Partial<Pick<TMarkup, Extract<keyof TMarkup, keyof typeof defaultMarkup>>>;
type LocalizedMessageProps<TMessage extends Message> =
  AdapterProps<TMessage> extends {
    markup: infer TMarkup;
  }
    ? Omit<AdapterProps<TMessage>, "markup"> &
        (keyof Omit<TMarkup, keyof typeof defaultMarkup> extends never
          ? { markup?: CustomMarkup<TMarkup> }
          : { markup: CustomMarkup<TMarkup> })
    : AdapterProps<TMessage>;

export function LocalizedMessage<TMessage extends Message>(props: LocalizedMessageProps<TMessage>) {
  const messageProps = mergeProps(props, {
    get markup() {
      return { ...defaultMarkup, ...props.markup };
    },
  }) as AdapterProps<TMessage>;

  return (
    <Suspense fallback={props.message(props.inputs ?? {}, props.options)}>
      {createComponent(LazyMessage<TMessage>, messageProps)}
    </Suspense>
  );
}
