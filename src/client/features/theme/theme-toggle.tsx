import { createSignal, onCleanup, onMount } from "solid-js";
import { mergeProps } from "@zag-js/solid";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { theme_current, theme_observe, theme_set, type Theme } from "./theme";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function ThemeToggle(props: { class?: string }) {
  const locale = useLocale();
  const [theme, setTheme] = createSignal<Theme>();
  onMount(() => {
    setTheme(theme_current());
    onCleanup(theme_observe(setTheme));
  });

  const toggle = () => {
    const next = theme_current() === "dark" ? "light" : "dark";
    theme_set(next);
  };

  const label = () =>
    theme() === "dark"
      ? m.theme_light({}, { locale: locale() })
      : m.theme_dark({}, { locale: locale() });

  return (
    <Tooltip label={label()}>
      {(triggerProps) => (
        <IconButton
          {...mergeProps(triggerProps, { onClick: toggle })}
          aria-label={label()}
          class={props.class}
        >
          <span aria-hidden="true">{theme() === "light" ? "☀" : "☾"}</span>
        </IconButton>
      )}
    </Tooltip>
  );
}
