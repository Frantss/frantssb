import { afterEach, expect, it, vi } from "vite-plus/test";

const sdk = vi.hoisted(() => ({ init: vi.fn() }));
const extensions = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("posthog-js/dist/module.slim", () => ({ default: sdk }));
vi.mock("posthog-js/dist/extension-bundles", () => {
  extensions.load();
  return { AnalyticsExtensions: {}, ErrorTrackingExtensions: {}, SessionReplayExtensions: {} };
});
afterEach(() => vi.unstubAllEnvs());

it("loads extensions only when configured and initializes once for concurrent callers", async () => {
  vi.stubEnv("PROD", true);
  vi.stubEnv("VITE_POSTHOG_KEY", "");
  const { posthog_initialize } = await import("../posthog");
  await posthog_initialize();
  expect(extensions.load).not.toHaveBeenCalled();

  vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
  vi.stubEnv("VITE_POSTHOG_HOST", "https://analytics.example.test");
  vi.stubEnv("VITE_POSTHOG_PERSISTENCE", "memory");
  const clients = await Promise.all([posthog_initialize(), posthog_initialize()]);
  expect(extensions.load).toHaveBeenCalledOnce();
  expect(sdk.init).toHaveBeenCalledOnce();
  expect(clients).toEqual([sdk, sdk]);
});
