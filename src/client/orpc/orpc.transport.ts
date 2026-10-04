import { createORPCClient } from "@orpc/client";
import type { RouterContractClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi";
import { OpenAPILink } from "@orpc/openapi/fetch";
import { createRouterClient } from "@orpc/server";
import { createIsomorphicFn } from "@tanstack/solid-start";
import { getRequestHeaders } from "@tanstack/solid-start/server";
import { createContext } from "@/server/orpc/orpc.context";
import { router } from "@/server/orpc/orpc.router";
import { contract } from "@/shared/orpc/orpc.contract";

const getClient = createIsomorphicFn()
  .client((): JsonifiedClient<RouterContractClient<typeof contract>> =>
    createORPCClient(new OpenAPILink(contract, { url: "/api" })),
  )
  .server(() =>
    createRouterClient(router, {
      context: () => createContext(getRequestHeaders()),
    }),
  );

export const client: JsonifiedClient<RouterContractClient<typeof contract>> = getClient();
