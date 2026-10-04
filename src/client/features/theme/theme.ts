import { aria_prefersReduced } from "@/client/lib/motion";

export type Theme = "light" | "dark";

// Self-contained: its source is inlined into <head> by theme_script, so it must not reference outer scope.
export function theme_applyStored() {
  const match = /(?:^|;\s*)theme=(light|dark)(?:;|$)/.exec(document.cookie);

  if (match) document.documentElement.dataset.theme = match[1];
}

export const theme_script = `(${theme_applyStored.toString()})()`;

export function theme_current(): Theme {
  const stored = document.documentElement.dataset.theme;

  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function theme_set(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export async function theme_reveal(theme: Theme, button: HTMLElement) {
  const root = document.documentElement;

  if (!document.startViewTransition || aria_prefersReduced()) {
    return void theme_set(theme);
  }
  if (root.hasAttribute("data-theme-transition")) return;

  const bounds = button.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  root.dataset.themeTransition = "";
  const transition = document.startViewTransition(() => theme_set(theme));
  let animation: Animation | undefined;

  try {
    await transition.ready;
    animation = root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 550,
        easing: "ease-in-out",
        fill: "both",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  } catch {
    transition.skipTransition();
  } finally {
    await transition.finished;
    animation?.cancel();
    delete root.dataset.themeTransition;
  }
}

// The document attribute is the source of truth, so every toggle on the page follows any change to it.
export function theme_observe(onChange: (theme: Theme) => void) {
  const observer = new MutationObserver(() => onChange(theme_current()));

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  return () => observer.disconnect();
}
