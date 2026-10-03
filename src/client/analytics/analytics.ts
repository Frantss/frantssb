import { posthog_initialize } from "@/client/posthog/posthog";
import { createIsomorphicFn } from "@tanstack/solid-start";

/** @public */
export function analytics_autocapture<Properties extends { id: string } & Record<string, string>>(
  properties: Properties,
) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [`data-ph-capture-attribute-${key}`, value]),
  ) as {
    [Key in keyof Properties & string as `data-ph-capture-attribute-${Key}`]: Properties[Key];
  };
}

export const analytics_capture = createIsomorphicFn()
  .server((_event: string, _properties: Record<string, unknown>) => undefined)
  .client((event: string, properties: Record<string, unknown>) => {
    const timestamp = new Date();
    const page = { $current_url: window.location.href, $pathname: window.location.pathname };
    void posthog_initialize()
      ?.then((client) => {
        client?.capture(event, { ...page, ...properties }, { timestamp });
      })
      .catch(() => undefined);
  });
