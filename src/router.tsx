import { createRouter as createTanStackRouter } from "@tanstack/solid-router";
import { aria_prefersReduced } from "@/client/lib/motion";
import { routeTree } from "@/routeTree.gen";

export function getRouter() {
  return createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultViewTransition: {
      types: () => (aria_prefersReduced() ? false : []),
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
