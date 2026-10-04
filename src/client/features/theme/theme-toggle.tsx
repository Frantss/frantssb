import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { IconMoon, IconSun } from "@tabler/icons-solidjs";
import { mergeProps } from "@zag-js/solid";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { theme_current, theme_observe, theme_set, type Theme } from "./theme";
import { m } from "@/paraglide/messages";

export function ThemeToggle(props: { class?: string }) {
  const [theme, setTheme] = createSignal<Theme>();
  onMount(() => {
    setTheme(theme_current());
    onCleanup(theme_observe(setTheme));
  });

  const toggle = () => {
    const next = theme_current() === "dark" ? "light" : "dark";
    theme_set(next);
  };

  const label = () => (theme() === "dark" ? m.theme_light() : m.theme_dark());

  return (
    <Tooltip label={label()}>
      {(triggerProps) => (
        <IconButton
          {...mergeProps(triggerProps, { onClick: toggle })}
          aria-label={label()}
          class={props.class}
        >
          <Show when={theme() === "light"} fallback={<IconMoon size={18} aria-hidden="true" />}>
            <IconSun size={18} aria-hidden="true" />
          </Show>
        </IconButton>
      )}
    </Tooltip>
  );
}
