import { cn } from "@/client/lib/cn";
import { mergeProps } from "@zag-js/solid";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { m } from "@/paraglide/messages";
import { setLocale } from "@/paraglide/runtime";
import { useLocale } from "./locale.context";
import { analytics_autocapture } from "@/client/analytics/analytics";

export function LocaleToggle(props: { class?: string; placement: "header" | "dock" }) {
  const locale = useLocale();
  const toggle = () => {
    void setLocale(locale() === "en" ? "es" : "en");
  };

  const label = () =>
    locale() === "en"
      ? m.locale_spanish({}, { locale: locale() })
      : m.locale_english({}, { locale: locale() });

  return (
    <Tooltip label={label()}>
      {(triggerProps) => (
        <IconButton
          {...mergeProps(triggerProps, { onClick: toggle })}
          {...analytics_autocapture({ id: "locale-toggle", placement: props.placement })}
          class={cn("shrink-0 text-xs font-bold", props.class)}
          aria-label={label()}
        >
          <span aria-hidden="true">{locale().toUpperCase()}</span>
        </IconButton>
      )}
    </Tooltip>
  );
}
