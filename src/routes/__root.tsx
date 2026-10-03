import { HeadContent, Outlet, ScriptOnce, Scripts, createRootRoute } from "@tanstack/solid-router";

import { HydrationScript } from "solid-js/web";
import { createSignal, onMount, Suspense, type ParentProps } from "solid-js";
import { posthog_initialize } from "@/client/posthog/posthog";
import { console_install } from "@/client/features/console/console";
import { theme_script } from "@/client/features/theme/theme";
import geistMonoUrl from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import { getLocale } from "@/paraglide/runtime";
import { LocaleProvider } from "@/client/features/localization/locale.context";

import "@/client/styles/global.css";
import "virtual:highlight.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      {
        rel: "preload",
        href: geistMonoUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
  }),
  shellComponent: RootComponent,
  component: Outlet,
});

function RootComponent(props: ParentProps) {
  const [locale] = createSignal(getLocale());
  onMount(posthog_initialize);
  onMount(console_install);

  return (
    <LocaleProvider locale={locale}>
      <html lang={locale()}>
        <head>
          <ScriptOnce>{theme_script}</ScriptOnce>
          <HydrationScript />
        </head>
        <body>
          <HeadContent />
          <Suspense>{props.children}</Suspense>
          <Scripts />
        </body>
      </html>
    </LocaleProvider>
  );
}
