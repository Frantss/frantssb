// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const sdk = vi.hoisted(() => ({
  constructor: vi.fn(),
  shutdown: vi.fn<() => Promise<void>>(),
}));

vi.mock("posthog-node", () => ({
  PostHog: class {
    shutdown = sdk.shutdown;

    constructor(token: string, options: Record<string, unknown>) {
      sdk.constructor(token, options);
    }
  },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
  vi.resetModules();
});

describe("server PostHog", () => {
  it("stays disabled without a project token", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "");
    const { posthog_initialize } = await import("@/server/posthog/posthog");

    expect(posthog_initialize()).toBeUndefined();
    expect(sdk.constructor).not.toHaveBeenCalled();
  });

  it("creates one flush-on-capture client from server environment settings", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "  phc_project  ");
    vi.stubEnv("POSTHOG_HOST", "  https://eu.i.posthog.com  ");
    const { posthog_initialize } = await import("@/server/posthog/posthog");

    expect(posthog_initialize()).toBe(posthog_initialize());
    expect(sdk.constructor).toHaveBeenCalledOnce();
    expect(sdk.constructor).toHaveBeenCalledWith("phc_project", {
      host: "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
      enableExceptionAutocapture: true,
    });
  });

  it("does not fail requests when client initialization fails", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_project");
    sdk.constructor.mockImplementationOnce(() => {
      throw new Error("invalid configuration");
    });
    const { posthog_initialize } = await import("@/server/posthog/posthog");

    expect(posthog_initialize()).toBeUndefined();
  });

  it("uses the US ingestion host by default", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_project");
    vi.stubEnv("POSTHOG_HOST", "");
    const { posthog_initialize } = await import("@/server/posthog/posthog");

    posthog_initialize();
    expect(sdk.constructor).toHaveBeenCalledWith(
      "phc_project",
      expect.objectContaining({ host: "https://us.i.posthog.com" }),
    );
  });
});
