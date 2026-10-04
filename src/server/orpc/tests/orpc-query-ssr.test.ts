import { QueryClient } from "@tanstack/solid-query";
import { afterAll, afterEach, describe, expect, it, vi } from "vite-plus/test";
import { orpc } from "@/client/orpc/orpc.query";
import { db } from "@/server/db/db";
import { createContext } from "@/server/orpc/orpc.context";

const current = vi.hoisted(() => ({ request: new Request("http://localhost/") }));

vi.mock("@tanstack/solid-start/server", () => ({
  getRequestHeaders: () => current.request.headers,
}));
vi.mock("@/server/orpc/orpc.context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/orpc/orpc.context")>();

  return { ...actual, createContext: vi.fn(actual.createContext) };
});

afterEach(() => vi.unstubAllGlobals());
afterAll(() => db.$client.end());

describe("oRPC query options during SSR", () => {
  it("calls handlers without fetch and creates context for each incoming request", async () => {
    const fetch = vi.fn(() => {
      throw new Error("SSR must not fetch its own API");
    });

    vi.stubGlobal("fetch", fetch);
    const queryClient = new QueryClient();

    try {
      current.request = new Request("https://first.example/writing", {
        headers: { "x-request-id": "first" },
      });
      await expect(queryClient.fetchQuery(orpc.health.queryOptions())).resolves.toEqual({
        status: "ok",
      });
      expect(createContext).toHaveBeenNthCalledWith(1, current.request.headers);
      current.request = new Request("https://second.example/projects", {
        headers: { "x-request-id": "second" },
      });
      await expect(queryClient.fetchQuery(orpc.health.queryOptions())).resolves.toEqual({
        status: "ok",
      });
      expect(createContext).toHaveBeenNthCalledWith(2, current.request.headers);
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      queryClient.clear();
    }
  });
});
