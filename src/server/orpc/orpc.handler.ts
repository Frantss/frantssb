import "@tanstack/solid-start/server-only";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { router } from "@/server/orpc/orpc.router";
import { createContext } from "@/server/orpc/orpc.context";
import { posthog_initialize } from "@/server/posthog/posthog";

const handler = new OpenAPIHandler(router);

export async function handleAPI(request: Request): Promise<Response> {
  const posthog = posthog_initialize();
  const handle = () =>
    handler.handle(request, {
      prefix: "/api",
      context: () => createContext(request.headers),
    });
  const sessionId = request.headers.get("x-posthog-session-id") ?? undefined;
  const distinctId = request.headers.get("x-posthog-distinct-id") ?? undefined;
  const { response } = await (posthog
    ? posthog.withContext({ sessionId, distinctId }, handle, { fresh: true })
    : handle());

  return response ?? new Response("Not found", { status: 404 });
}
