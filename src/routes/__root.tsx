import { HeadContent, Outlet, ScriptOnce, Scripts, createRootRoute } from "@tanstack/solid-router";

import { HydrationScript } from "solid-js/web";
import { onMount, Suspense, type ParentProps } from "solid-js";
import { posthog_initialize } from "@/client/posthog/posthog";
import { theme_script } from "@/client/features/theme/theme";

import "@/client/styles/global.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
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
