import { createRouter as createTanStackRouter } from "@tanstack/solid-router";
import { aria_prefersReduced } from "@/client/lib/motion";
import { Frame } from "@/client/ui/frame";
import { routeTree } from "@/routeTree.gen";

export function getRouter() {
  return createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    scrollToTopSelectors: [Frame.fillSelector],
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
