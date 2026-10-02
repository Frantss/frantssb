import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createIsomorphicFn } from "@tanstack/solid-start";
import { getRequestHeaders } from "@tanstack/solid-start/server";
import { posthog_initialize } from "@/client/posthog/posthog";
import { publicRouter } from "@/server/orpc/orpc.router";
import { contract } from "@/shared/orpc/orpc.contract";
import { createContext } from "@/server/orpc/orpc.context";

const getClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(publicRouter, {
      context: () => createContext(getRequestHeaders()),
    }),
  )
  .client((): RouterClient<typeof publicRouter> => {
    const link = new OpenAPILink(contract, {
      url: "/api",
      headers: async () => {
        try {
          const posthog = await posthog_initialize();
          if (!posthog) return {};
          const sessionId = posthog.get_session_id();
          const distinctId = posthog.get_distinct_id();
          return {
            ...(sessionId && { "x-posthog-session-id": sessionId }),
            ...(distinctId && { "x-posthog-distinct-id": distinctId }),
          };
        } catch {
          return {};
        }
      },
    });
    return createORPCClient(link);
  });

export const client: RouterClient<typeof publicRouter> = getClient();
