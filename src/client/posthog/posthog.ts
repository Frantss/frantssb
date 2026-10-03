import { createClientOnlyFn } from "@tanstack/solid-start";

type PostHogClient = (typeof import("posthog-js/dist/module.slim"))["default"];
let initialization: Promise<PostHogClient | undefined> | undefined;

export const posthog_initialize = createClientOnlyFn(() => {
  const token = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;
  const persistence = import.meta.env.VITE_POSTHOG_PERSISTENCE;
  if (
    !import.meta.env.PROD ||
    !token ||
    !host ||
    (persistence !== "memory" && persistence !== "localStorage+cookie")
  ) {
    return;
  }

  initialization ??= Promise.all([
    import("posthog-js/dist/module.slim"),
    import("posthog-js/dist/extension-bundles"),
  ])
    .then(
      ([
        { default: posthog },
        { AnalyticsExtensions, ErrorTrackingExtensions, SessionReplayExtensions },
      ]) => {
        posthog.init(token, {
          api_host: host,
          ui_host: "https://us.posthog.com",
          defaults: "2026-08-30",
          persistence,
          person_profiles: "never",
          autocapture: true,
          capture_pageview: "history_change",
          __extensionClasses: {
            ...SessionReplayExtensions,
            ...ErrorTrackingExtensions,
            autocapture: AnalyticsExtensions.autocapture,
            historyAutocapture: AnalyticsExtensions.historyAutocapture,
          },
          capture_exceptions: {
            capture_unhandled_errors: true,
            capture_unhandled_rejections: true,
            capture_console_errors: false,
          },
          capture_pageleave: true,
          disable_session_recording: false,
          session_recording: { maskAllInputs: true },
          disable_external_dependency_loading: false,
          advanced_disable_feature_flags: true,
          save_referrer: true,
          save_campaign_params: true,
        });
        return posthog;
      },
    )
    .catch(() => undefined);
  return initialization;
});
