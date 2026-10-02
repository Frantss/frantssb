import { createSignal, onMount } from "solid-js";
import { IconButton } from "@/client/ui/icon-button";
import { theme_current, theme_set, type Theme } from "./theme";

export function ThemeToggle() {
  const [theme, setTheme] = createSignal<Theme>();
  onMount(() => setTheme(theme_current()));

  const toggle = () => {
    const next = theme_current() === "dark" ? "light" : "dark";
    theme_set(next);
    setTheme(next);
  };

  return (
    <IconButton
      aria-label={theme() === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
    >
      <span aria-hidden="true">{theme() === "light" ? "☀" : "☾"}</span>
    </IconButton>
  );
}
