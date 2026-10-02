import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";

const sdk = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock("posthog-js/dist/module.slim", () => ({ default: sdk }));
vi.mock("posthog-js/dist/extension-bundles", () => ({
  AnalyticsExtensions: { autocapture: "autocapture", historyAutocapture: "historyAutocapture" },
  ErrorTrackingExtensions: { exceptionObserver: "exceptionObserver", exceptions: "exceptions" },
  SessionReplayExtensions: { sessionRecording: "sessionRecording" },
}));

beforeEach(() => {
  vi.stubEnv("PROD", true);
  vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
  vi.stubEnv("VITE_POSTHOG_HOST", "https://analytics.example.test");
  vi.stubEnv("VITE_POSTHOG_PERSISTENCE", "memory");
});
afterEach(() => vi.unstubAllEnvs());

it("contains initialization failures", async () => {
  sdk.init.mockImplementationOnce(() => {
    throw new Error("unavailable");
  });
  const { posthog_initialize } = await import("@/client/posthog/posthog");

  await expect(posthog_initialize()).resolves.toBeUndefined();
});
