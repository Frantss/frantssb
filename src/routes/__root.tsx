import { HeadContent, Outlet, ScriptOnce, Scripts, createRootRoute } from "@tanstack/solid-router";

import { HydrationScript } from "solid-js/web";
import { onMount, Suspense, type ParentProps } from "solid-js";
import { posthog_initialize } from "@/client/posthog/posthog";
import { theme_script } from "@/client/features/theme/theme";
import geistMonoUrl from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";

import "@/client/styles/global.css";

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
    ],
  }),
  shellComponent: RootComponent,
  component: Outlet,
});

function RootComponent(props: ParentProps) {
  onMount(posthog_initialize);

  return (
    <html lang="en">
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
  );
}
