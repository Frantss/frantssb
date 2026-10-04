import { QueryClient } from "@tanstack/solid-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/solid-router-ssr-query";
import { createRouter as createTanStackRouter } from "@tanstack/solid-router";
import { orpc } from "@/client/orpc/orpc.query";
import { aria_prefersReduced } from "@/client/lib/motion";
import { Frame } from "@/client/ui/frame";
import { routeTree } from "@/routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  });
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, orpc },

    scrollRestoration: true,
    scrollToTopSelectors: [Frame.fillSelector],
    defaultViewTransition: {
      types: () => (aria_prefersReduced() ? false : []),
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
