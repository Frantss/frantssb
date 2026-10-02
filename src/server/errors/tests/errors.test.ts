// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const posthog = vi.hoisted(() => {
  const client = { captureException: vi.fn(), flush: vi.fn<() => Promise<void>>() };
  return { client, initialize: vi.fn<() => typeof client | undefined>() };
});
vi.mock("@/server/posthog/posthog", () => ({ posthog_initialize: posthog.initialize }));

beforeEach(() => {
  vi.resetAllMocks();
  posthog.initialize.mockReturnValue(posthog.client);
});

describe("server errors", () => {
  it("captures and flushes a handled exception", async () => {
    const { errors_capture } = await import("@/server/errors/errors");
    const error = new Error("save failed");

    await expect(errors_capture(error, "client_1", { operation: "save" })).resolves.toBe(true);
    expect(posthog.client.captureException).toHaveBeenCalledWith(error, "client_1", {
      operation: "save",
    });
    expect(posthog.client.flush).toHaveBeenCalledOnce();
  });

  it("does not capture when PostHog is disabled", async () => {
    posthog.initialize.mockReturnValueOnce(undefined);
    const { errors_capture } = await import("@/server/errors/errors");

    await expect(errors_capture(new Error("unavailable"))).resolves.toBe(false);
    expect(posthog.client.captureException).not.toHaveBeenCalled();
  });

  it("contains PostHog delivery failures", async () => {
    posthog.client.flush.mockRejectedValueOnce(new Error("unavailable"));
    const { errors_capture } = await import("@/server/errors/errors");

    await expect(errors_capture(new Error("unavailable"))).resolves.toBe(false);
  });
});
