import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const posthog = vi.hoisted(() => {
  const client = { addExceptionStep: vi.fn(), captureException: vi.fn() };
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

describe("errors", () => {
  it("adds breadcrumbs after PostHog initializes", async () => {
    const { errors_breadcrumb } = await import("@/client/errors/errors");

    errors_breadcrumb("Quiz submitted", { requestId: "request-1" });

    await vi.waitFor(() =>
      expect(posthog.client.addExceptionStep).toHaveBeenCalledWith("Quiz submitted", {
        requestId: "request-1",
      }),
    );
  });

  it("captures handled exceptions after PostHog initializes", async () => {
    const { errors_capture } = await import("@/client/errors/errors");
    const error = new Error("unavailable");

    errors_capture(error, { operation: "save" });

    await vi.waitFor(() =>
      expect(posthog.client.captureException).toHaveBeenCalledWith(error, {
        operation: "save",
      }),
    );
  });

  it("does not capture when PostHog is disabled", async () => {
    posthog.initialize.mockReturnValueOnce(undefined);
    const { errors_capture } = await import("@/client/errors/errors");

    errors_capture(new Error("unavailable"));
    await Promise.resolve();

    expect(posthog.client.captureException).not.toHaveBeenCalled();
  });

  it("contains PostHog failures", async () => {
    posthog.initialize.mockRejectedValueOnce(new Error("unavailable"));
    const { errors_capture } = await import("@/client/errors/errors");

    errors_capture(new Error("unavailable"));
    await vi.waitFor(() => expect(posthog.initialize).toHaveBeenCalledOnce());
    expect(posthog.client.captureException).not.toHaveBeenCalled();

    posthog.client.captureException.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    errors_capture(new Error("unavailable"));
    await vi.waitFor(() => expect(posthog.client.captureException).toHaveBeenCalledOnce());
  });
});
