import "@tanstack/solid-start/server-only";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { router } from "@/server/orpc/orpc.router";
import { createContext } from "@/server/orpc/orpc.context";

const handler = new OpenAPIHandler(router);

export async function handleAPI(request: Request): Promise<Response> {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: () => createContext(request.headers),
  });

  return response ?? new Response("Not found", { status: 404 });
}
