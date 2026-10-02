import { createFileRoute } from "@tanstack/solid-router";
import { getRequestIP } from "@tanstack/solid-start/server";
import { analytics_proxy } from "@/server/analytics/analytics.proxy";

export const Route = createFileRoute("/api/angry-ankylosaurus/$")({
  server: {
    handlers: {
      ANY: ({ request }) =>
        analytics_proxy(
          request,
          process.env.RAILWAY_ENVIRONMENT_ID
            ? (request.headers.get("x-real-ip") ?? getRequestIP())
            : getRequestIP(),
        ),
    },
  },
});
