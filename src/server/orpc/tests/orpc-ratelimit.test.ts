import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createContext } from "@/server/orpc/orpc.context";
import { handleAPI } from "@/server/orpc/orpc.handler";
import { router } from "@/server/orpc/orpc.router";
import { contract } from "@/shared/orpc/orpc.contract";

const database = vi.hoisted(() => ({ write: vi.fn(), read: vi.fn(), search: vi.fn() }));

vi.mock("@/server/db/db", () => ({
  db: {
    insert: () => ({
      values: () => ({ onConflictDoUpdate: () => ({ returning: database.write }) }),
    }),
    select: () => ({ from: () => ({ where: database.read }) }),
  },
}));
vi.mock("@/server/features/articles/article-index", () => ({
  article_queryIndex: database.search,
}));
vi.mock("@/lib/articles/article-metadata", () => ({
  article_revision: "test",
  article_list: () => ["first", "second"].map((slug) => ({ slug })),
}));

let now = Date.UTC(2030, 0, 1);

beforeEach(() => {
  now += 120_000;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  vi.stubEnv("RAILWAY_ENVIRONMENT_ID", "rate-limit-test");
  vi.clearAllMocks();
  database.write.mockResolvedValue([{ count: 1 }]);
  database.read.mockResolvedValue([]);
  database.search.mockResolvedValue({ items: [], total: 0 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

function request(path: string, method = "GET", address = "192.0.2.1") {
  return handleAPI(
    new Request(`http://localhost/api${path}`, {
      method,
      headers: { "x-real-ip": address, "x-request-source": "ssr" },
    }),
  );
}

describe("API rate limiting", () => {
  it("limits concurrent likes across article slugs before writing, with typed errors and HTTP headers", async () => {
    const responses = await Promise.all(
      Array.from({ length: 40 }, (_, index) =>
        request(`/articles/${index % 2 ? "first" : "second"}/likes`, "POST"),
      ),
    );

    expect(responses.filter((response) => response.status === 200)).toHaveLength(30);
    expect(database.write).toHaveBeenCalledTimes(30);
    const blocked = responses.filter((response) => response.status === 429);

    expect(blocked).toHaveLength(10);
    expect(blocked[0].headers.get("Retry-After")).toBe("10");
    expect(blocked[0].headers.get("RateLimit-Limit")).toBe("30");
    expect(blocked[0].headers.get("RateLimit-Remaining")).toBe("0");
    await expect(blocked[0].json()).resolves.toMatchObject({
      defined: true,
      code: "TOO_MANY_REQUESTS",
      data: { limit: 30, remaining: 0, reset: now + 10_000 },
    });
    expect((await request("/articles/first/likes", "POST", "192.0.2.2")).status).toBe(200);
    const client: RouterClient<typeof router> = createORPCClient(
      new OpenAPILink(contract, {
        url: "/api",
        origin: "http://localhost",
        headers: { "x-real-ip": "192.0.2.1" },
        fetch: (url, init) => handleAPI(new Request(url, init)),
      }),
    );

    await expect(client.articles.likes.add({ slug: "first" })).rejects.toMatchObject({
      defined: true,
      code: "TOO_MANY_REQUESTS",
      data: { reset: now + 10_000 },
    });
  });

  it("resets the burst window while retaining the minute limit", async () => {
    for (let window = 0; window < 4; window++) {
      vi.setSystemTime(now + window * 10_000);
      const responses = await Promise.all(
        Array.from({ length: 30 }, () => request("/articles/first/likes", "POST")),
      );

      expect(responses.every((response) => response.status === 200)).toBe(true);
    }
    vi.setSystemTime(now + 40_000);
    const blocked = await request("/articles/first/likes", "POST");

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("RateLimit-Limit")).toBe("120");
    expect(blocked.headers.get("Retry-After")).toBe("20");
    expect(database.write).toHaveBeenCalledTimes(120);
    vi.setSystemTime(now + 60_000);
    expect((await request("/articles/first/likes", "POST")).status).toBe(200);
  });

  it("uses independent read quotas and leaves health and direct SSR calls available", async () => {
    const searches = await Promise.all(Array.from({ length: 61 }, () => request("/articles")));
    const reads = await Promise.all(
      Array.from({ length: 241 }, () => request("/articles/first/likes")),
    );

    expect(searches.filter((response) => response.status === 200)).toHaveLength(60);
    expect(searches[60].status).toBe(429);
    expect(reads.filter((response) => response.status === 200)).toHaveLength(240);
    expect(reads[240].status).toBe(429);
    expect(database.search).toHaveBeenCalledTimes(60);
    expect(database.read).toHaveBeenCalledTimes(240);
    const health = await request("/health");

    expect(health.status).toBe(200);
    expect(health.headers.has("RateLimit-Limit")).toBe(false);
    const ssr = createRouterClient(router, {
      context: () =>
        createContext({ headers: new Headers({ "x-real-ip": "192.0.2.1" }), source: "ssr" }),
    });

    await expect(ssr.articles.get({})).resolves.toEqual({ items: [], total: 0 });
    await expect(ssr.articles.likes.get({ slug: "first" })).resolves.toEqual({ count: 0 });
    expect((await request("/articles")).status).toBe(429);
  });

  it("normalizes IP aliases and ignores untrusted headers outside Railway", () => {
    const key = (address: string) =>
      createContext({ headers: new Headers({ "x-real-ip": address }) }).clientIP;

    expect(key(" ::ffff:192.0.2.1 ")).toBe(key("192.0.2.1"));
    expect(key("2001:0db8:0000:0000:0000:0000:0000:0001")).toBe(key("2001:db8::1"));
    expect(key("invalid")).toBe("unknown");
    expect(key("fe80::1%eth0")).toBe("unknown");
    expect(key("192.0.2.1, 192.0.2.2")).toBe("unknown");
    expect(createContext({ headers: new Headers() }).clientIP).toBe("unknown");
    vi.stubEnv("RAILWAY_ENVIRONMENT_ID", undefined);
    expect(key("192.0.2.1")).toBe("unknown");
    expect(key("192.0.2.2")).toBe("unknown");
  });
});
