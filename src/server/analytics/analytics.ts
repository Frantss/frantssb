import "@tanstack/solid-start/server-only";
import { posthog_initialize } from "@/server/posthog/posthog";
import type { EventMessage } from "posthog-node";

export async function analytics_capture(event: EventMessage): Promise<boolean> {
  try {
    const posthog = posthog_initialize();
    if (!posthog) return false;
    posthog.capture(event);
    await posthog.flush();
    return true;
  } catch {
    return false;
  }
}
