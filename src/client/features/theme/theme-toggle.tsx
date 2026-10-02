import { createSignal, onMount } from "solid-js";
import { IconButton } from "@/client/ui/icon-button";
import { theme_current, theme_set, type Theme } from "./theme";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function ThemeToggle() {
  const locale = useLocale();
  const [theme, setTheme] = createSignal<Theme>();
  onMount(() => setTheme(theme_current()));

  const toggle = () => {
    const next = theme_current() === "dark" ? "light" : "dark";
    theme_set(next);
    setTheme(next);
  };

  return (
    <IconButton
      aria-label={
        theme() === "dark"
          ? m.theme_light({}, { locale: locale() })
          : m.theme_dark({}, { locale: locale() })
      }
      onClick={toggle}
    >
      <span aria-hidden="true">{theme() === "light" ? "☀" : "☾"}</span>
    </IconButton>
  );
}
