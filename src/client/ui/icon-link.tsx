import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

export function IconLink(props: ComponentProps<"a"> & { "aria-label": string }) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <a
      {...rest}
      class={cn(
        "grid size-11 shrink-0 place-items-center border border-line-strong bg-transparent p-0 text-muted no-underline hover:border-faint hover:text-fg focus-visible:text-fg sm:size-[34px]",
        local.class,
      )}
    />
  );
}
