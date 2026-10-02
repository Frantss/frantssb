import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const posthog = vi.hoisted(() => ({
  initialize: vi.fn(),
  sessionId: "ad55e50a-449e-47c1-a67f-0de5f442ff73",
  distinctId: "browser-distinct-id",
}));
vi.mock("@/client/posthog/posthog", () => ({ posthog_initialize: posthog.initialize }));

beforeEach(() => {
  vi.resetAllMocks();
  posthog.initialize.mockResolvedValue({
    get_session_id: () => posthog.sessionId,
    get_distinct_id: () => posthog.distinctId,
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("browser oRPC analytics headers", () => {
  it("adds current PostHog IDs to every browser request", async () => {
    const requests: Headers[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        requests.push(new Headers(init.headers));
        return Response.json({ status: "ok" });
      }),
    );
    const { client } = await import("@/integrations/orpc/orpc-client");

    await client.health();
    await client.health();

    expect(posthog.initialize).toHaveBeenCalledTimes(2);
    for (const headers of requests) {
      expect(headers.get("x-posthog-session-id")).toBe(posthog.sessionId);
      expect(headers.get("x-posthog-distinct-id")).toBe(posthog.distinctId);
    }
  });

  it("sends the request when browser analytics fails", async () => {
    posthog.initialize.mockRejectedValueOnce(new Error("unavailable"));
    let requestHeaders: Headers | undefined;
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      requestHeaders = new Headers(init.headers);
      return Response.json({ status: "ok" });
    });
    vi.stubGlobal("fetch", fetch);
    const { client } = await import("@/integrations/orpc/orpc-client");

    await expect(client.health()).resolves.toEqual({ status: "ok" });
    expect(fetch).toHaveBeenCalledOnce();
    expect(requestHeaders?.has("x-posthog-session-id")).toBe(false);
  });
});
