import { posthog_initialize } from "@/client/posthog/posthog";
import { createIsomorphicFn } from "@tanstack/solid-start";

export const errors_capture = createIsomorphicFn()
  .server((_error: unknown, _properties?: Record<string, unknown>) => undefined)
  .client((error: unknown, properties?: Record<string, unknown>) => {
    void posthog_initialize()
      ?.then((client) => {
        client?.captureException(error, properties);
      })
      .catch(() => undefined);
  });

export const errors_breadcrumb = createIsomorphicFn()
  .server((_message: string, _properties?: Record<string, unknown>) => undefined)
  .client((message: string, properties?: Record<string, unknown>) => {
    void posthog_initialize()
      ?.then((client) => {
        client?.addExceptionStep(message, properties);
      })
      .catch(() => undefined);
  });
