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
