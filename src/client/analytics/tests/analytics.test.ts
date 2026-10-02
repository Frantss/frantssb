import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const posthog = vi.hoisted(() => {
  const client = { capture: vi.fn() };
  return {
    client,
    initialize: vi.fn<() => Promise<typeof client> | undefined>(() => Promise.resolve(client)),
  };
});
vi.mock("@/client/posthog/posthog", () => ({ posthog_initialize: posthog.initialize }));

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  posthog.initialize.mockResolvedValue(posthog.client);
});

describe("explicit analytics capture", () => {
  it("waits for one initialization and preserves event order and timestamps", async () => {
    const { analytics_capture } = await import("@/client/analytics/analytics");
    const before = Date.now();
    analytics_capture("first_event", { version: "1" });
    analytics_capture("second_event", { ids: ["one"] });
    await vi.waitFor(() => expect(posthog.client.capture).toHaveBeenCalledTimes(2));
    expect(posthog.initialize).toHaveBeenCalledTimes(2);
    expect(posthog.client.capture.mock.calls.map(([event]) => event)).toEqual([
      "first_event",
      "second_event",
    ]);
    expect(posthog.client.capture.mock.calls[0][2].timestamp.getTime()).toBeGreaterThanOrEqual(
      before,
    );
    expect(posthog.client.capture.mock.calls[0][1]).not.toHaveProperty("$session_id");
    expect(posthog.client.capture.mock.calls[0][1]).not.toHaveProperty("attempt_id");
  });

  it("does not capture when PostHog is disabled", async () => {
    posthog.initialize.mockReturnValueOnce(undefined);
    const { analytics_capture } = await import("@/client/analytics/analytics");
    analytics_capture("first_event", {});
    await Promise.resolve();
    expect(posthog.client.capture).not.toHaveBeenCalled();
  });

  it("contains PostHog initialization and capture failures", async () => {
    posthog.initialize.mockRejectedValueOnce(new Error("unavailable"));
    const { analytics_capture } = await import("@/client/analytics/analytics");
    analytics_capture("first_event", {});
    await vi.waitFor(() => expect(posthog.initialize).toHaveBeenCalledOnce());
    expect(posthog.client.capture).not.toHaveBeenCalled();

    posthog.client.capture.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    analytics_capture("first_event", {});
    await vi.waitFor(() => expect(posthog.client.capture).toHaveBeenCalledOnce());
  });
});
