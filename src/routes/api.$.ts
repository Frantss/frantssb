import { createFileRoute } from "@tanstack/solid-router";
import { handleAPI } from "@/server/orpc/orpc.handler";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: ({ request }) => handleAPI(request),
    },
  },
});
