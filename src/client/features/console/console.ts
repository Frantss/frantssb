import { createClientOnlyFn } from "@tanstack/solid-start";
import { analytics_capture } from "@/client/analytics/analytics";
import { portfolio_resume, profile } from "@/client/features/portfolio/portfolio.data";
import { theme_current, theme_set } from "@/client/features/theme/theme";
import { getLocale, setLocale } from "@/paraglide/runtime";

const banner = String.raw`
  __                   _
 / _| _ _  __ _  _ _  | |_  ___ ___
|  _|| '_|/ _' || ' \ |  _|(_-<(_-<
|_|  |_|  \__,_||_||_| \__|/__//__/
`;

// Devtools may be light or dark regardless of the page theme, so pick colors readable on both.
const style = {
  accent: "color: #8b5cf6; font-weight: bold",
  muted: "color: #8a8a8a",
  plain: "",
};

const stack = [
  ["Solid", "https://www.solidjs.com/"],
  ["TanStack Start", "https://tanstack.com/start"],
  ["Vite+", "https://viteplus.dev/"],
  ["Tailwind CSS", "https://tailwindcss.com/"],
  ["Paraglide", "https://inlang.com/m/gerre34r/library-inlang-paraglideJs"],
  ["PostHog", "https://posthog.com/"],
  ["Railway", "https://railway.com/"],
];

const commands = {
  help: {
    description: "list commands",
    run() {
      for (const [name, command] of Object.entries(commands)) {
        console.log(
          `%cfrantss.${name.padEnd(8)}%c${command.description}`,
          style.accent,
          style.muted,
        );
      }
    },
  },
  contact: {
    description: "say hi",
    run() {
      console.log(`%c${profile.email}`, style.accent);
      for (const link of profile.links) {
        console.log(`%c${link.label.padEnd(10)}%c${link.href}`, style.muted, style.plain);
      }
    },
  },
  resume: {
    description: "download the resume",
    run() {
      const resume = portfolio_resume(getLocale());
      const anchor = document.createElement("a");
      anchor.href = resume.href;
      anchor.download = resume.filename;
      anchor.click();
      console.log(`%cdownloading ${resume.filename}`, style.muted);
    },
  },
  theme: {
    description: "toggle light and dark",
    run() {
      const next = theme_current() === "dark" ? "light" : "dark";
      theme_set(next);
      console.log(`%ctheme → ${next}`, style.muted);
    },
  },
  lang: {
    description: "switch between english and spanish",
    run() {
      const next = getLocale() === "en" ? "es" : "en";
      console.log(`%clocale → ${next}, reloading`, style.muted);
      void setLocale(next);
    },
  },
  stack: {
    description: "what this site is built with",
    run() {
      for (const [name, href] of stack) {
        console.log(`%c${name.padEnd(16)}%c${href}`, style.accent, style.plain);
      }
    },
  },
} satisfies Record<string, { description: string; run: () => void }>;

export const console_install = createClientOnlyFn(() => {
  if (Object.hasOwn(window, "frantss")) return;

  // Getters let visitors type `frantss.help` without parentheses.
  const api = Object.freeze(
    Object.defineProperties(
      {},
      Object.fromEntries(
        Object.entries(commands).map(([name, command]) => [
          name,
          {
            enumerable: true,
            get() {
              command.run();
              analytics_capture("console_command_used", { command: name });
              return undefined;
            },
          },
        ]),
      ),
    ),
  );
  Object.defineProperty(window, "frantss", { value: api });

  console.log(`%c${banner}`, style.accent);
  console.log("%cpoking around? type %cfrantss.help", style.muted, style.accent);
});
