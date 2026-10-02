import "@tanstack/solid-start/server-only";
import { PostHog } from "posthog-node";

const defaultHost = "https://us.i.posthog.com";
let initialization: PostHog | undefined;

export function posthog_initialize(): PostHog | undefined {
  const token = process.env.VITE_POSTHOG_KEY?.trim();
  if (!token) return;

  try {
    initialization ??= new PostHog(token, {
      host: process.env.POSTHOG_HOST?.trim() || defaultHost,
      flushAt: 1,
      flushInterval: 0,
      enableExceptionAutocapture: true,
    });
  } catch {
    return;
  }
  return initialization;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    const posthog = initialization;
    initialization = undefined;
    void posthog?.shutdown();
  });
}
