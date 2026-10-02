// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const posthog = vi.hoisted(() => {
  const client = { capture: vi.fn(), flush: vi.fn<() => Promise<void>>() };
  return { client, initialize: vi.fn<() => typeof client | undefined>() };
});
vi.mock("@/server/posthog/posthog", () => ({ posthog_initialize: posthog.initialize }));

beforeEach(() => {
  vi.resetAllMocks();
  posthog.initialize.mockReturnValue(posthog.client);
});

describe("server analytics", () => {
  it("captures and flushes an event", async () => {
    const { analytics_capture } = await import("@/server/analytics/analytics");
    const event = {
      distinctId: "client_1",
      event: "item saved",
      properties: { pack: "starter" },
    };

    await expect(analytics_capture(event)).resolves.toBe(true);
    expect(posthog.client.capture).toHaveBeenCalledWith(event);
    expect(posthog.client.flush).toHaveBeenCalledOnce();
  });

  it("does not capture when PostHog is disabled", async () => {
    posthog.initialize.mockReturnValueOnce(undefined);
    const { analytics_capture } = await import("@/server/analytics/analytics");

    await expect(analytics_capture({ distinctId: "client_1", event: "item saved" })).resolves.toBe(
      false,
    );
    expect(posthog.client.capture).not.toHaveBeenCalled();
  });

  it("contains PostHog delivery failures", async () => {
    posthog.client.flush.mockRejectedValueOnce(new Error("unavailable"));
    const { analytics_capture } = await import("@/server/analytics/analytics");

    await expect(analytics_capture({ distinctId: "client_1", event: "item saved" })).resolves.toBe(
      false,
    );
  });
});
