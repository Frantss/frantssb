import { cn } from "@/client/lib/cn";
import { mergeProps } from "@zag-js/solid";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { m } from "@/paraglide/messages";
import { getLocale, setLocale } from "@/paraglide/runtime";
import { analytics_autocapture } from "@/client/analytics/analytics";

export function LocaleToggle(props: { class?: string; placement: "header" | "dock" }) {
  const toggle = () => {
    void setLocale(getLocale() === "en" ? "es" : "en");
  };

  const label = () => (getLocale() === "en" ? m.locale_spanish() : m.locale_english());

  return (
    <Tooltip label={label()}>
      {(triggerProps) => (
        <IconButton
          {...mergeProps(triggerProps, { onClick: toggle })}
          {...analytics_autocapture({ id: "locale-toggle", placement: props.placement })}
          class={cn("shrink-0 text-xs font-bold", props.class)}
          aria-label={label()}
        >
          <span aria-hidden="true">{getLocale().toUpperCase()}</span>
        </IconButton>
      )}
    </Tooltip>
  );
}
