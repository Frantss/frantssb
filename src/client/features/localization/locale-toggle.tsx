import { cn } from "@/client/lib/cn";
import { IconButton } from "@/client/ui/icon-button";
import { m } from "@/paraglide/messages";
import { setLocale } from "@/paraglide/runtime";
import { useLocale } from "./locale.context";

export function LocaleToggle(props: { class?: string }) {
  const locale = useLocale();
  const toggle = () => {
    void setLocale(locale() === "en" ? "es" : "en");
  };

  return (
    <IconButton
      class={cn("shrink-0 text-xs font-bold", props.class)}
      aria-label={
        locale() === "en"
          ? m.locale_spanish({}, { locale: locale() })
          : m.locale_english({}, { locale: locale() })
      }
      onClick={toggle}
    >
      <span aria-hidden="true">{locale().toUpperCase()}</span>
    </IconButton>
  );
}
