import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/solid-router";

import { HydrationScript } from "solid-js/web";
import { Suspense, type ParentProps } from "solid-js";

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
  return (
    <html lang="en">
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <Suspense>{props.children}</Suspense>
        <Scripts />
      </body>
    </html>
  );
}
