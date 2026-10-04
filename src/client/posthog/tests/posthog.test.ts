import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const sdk = vi.hoisted(() => ({ init: vi.fn() }));

vi.mock("posthog-js/dist/module.slim", () => ({ default: sdk }));
vi.mock("posthog-js/dist/extension-bundles", () => ({
  AnalyticsExtensions: { autocapture: "autocapture", historyAutocapture: "historyAutocapture" },
  ErrorTrackingExtensions: { exceptionObserver: "exceptionObserver", exceptions: "exceptions" },
  SessionReplayExtensions: { sessionRecording: "sessionRecording" },
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("PROD", true);
  vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
  vi.stubEnv("VITE_POSTHOG_HOST", "https://analytics.example.test");
  vi.stubEnv("VITE_POSTHOG_PERSISTENCE", "memory");
});
afterEach(() => vi.unstubAllEnvs());

describe("PostHog client", () => {
  it("initializes the slim SDK with analytics, replay, and error tracking", async () => {
    const { posthog_initialize } = await import("@/client/posthog/posthog");

    await Promise.all([posthog_initialize(), posthog_initialize()]);

    expect(sdk.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        capture_exceptions: {
          capture_unhandled_errors: true,
          capture_unhandled_rejections: true,
          capture_console_errors: false,
        },
        __extensionClasses: expect.objectContaining({
          autocapture: "autocapture",
          historyAutocapture: "historyAutocapture",
          exceptionObserver: "exceptionObserver",
          exceptions: "exceptions",
          sessionRecording: "sessionRecording",
        }),
      }),
    );
    expect(sdk.init).toHaveBeenCalledOnce();
  });

  it.each(["development", "missing token", "missing host", "invalid persistence"])(
    "does not initialize in %s",
    async (mode) => {
      if (mode === "development") vi.stubEnv("PROD", false);
      if (mode === "missing token") vi.stubEnv("VITE_POSTHOG_KEY", "");
      if (mode === "missing host") vi.stubEnv("VITE_POSTHOG_HOST", "");
      if (mode === "invalid persistence") vi.stubEnv("VITE_POSTHOG_PERSISTENCE", "cookie");
      const { posthog_initialize } = await import("@/client/posthog/posthog");

      await posthog_initialize();

      expect(sdk.init).not.toHaveBeenCalled();
    },
  );
});
