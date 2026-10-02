import "@tanstack/solid-start/server-only";
import { posthog_initialize } from "@/server/posthog/posthog";

export async function errors_capture(
  error: unknown,
  distinctId?: string,
  properties?: Record<string, unknown>,
): Promise<boolean> {
  try {
    const posthog = posthog_initialize();
    if (!posthog) return false;
    posthog.captureException(error, distinctId, properties);
    await posthog.flush();
    return true;
  } catch {
    return false;
  }
}
