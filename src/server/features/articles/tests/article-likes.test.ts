import { createORPCClient } from "@orpc/client";
import { OpenAPIHandler, OpenAPILink } from "@orpc/openapi/fetch";
import type { RouterClient } from "@orpc/server";
import { inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test";
import { db } from "@/server/db/db";
import { articleLikeCounts } from "@/server/db/db.schema";
import { router } from "@/server/orpc/orpc.router";
import { contract } from "@/shared/orpc/orpc.contract";

vi.mock("@/lib/articles/article-metadata", () => ({
  article_list: (locale: string) =>
    (locale === "es" ? ["likes-test-es"] : ["likes-test-first", "likes-test-second"]).map(
      (slug) => ({ slug, title: slug, date: "2026-10-03", body: [] }),
    ),
}));

describe("article likes with PostgreSQL", () => {
  const handler = new OpenAPIHandler(router);

  async function request(slug: string, method: "GET" | "POST" = "GET", body?: string) {
    const init: RequestInit =
      method === "POST"
        ? { method, body, headers: body ? { "Content-Type": "application/json" } : undefined }
        : { method };
    const { response } = await handler.handle(
      new Request(`http://localhost/api/articles/${slug}/likes`, init),
      { prefix: "/api", context: { headers: new Headers(), db } },
    );
    expect(response?.status).toBe(200);
    return response!.json();
  }

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: "./drizzle" });
  });

  afterEach(async () => {
    await db
      .delete(articleLikeCounts)
      .where(
        inArray(articleLikeCounts.articleSlug, [
          "likes-test-first",
          "likes-test-second",
          "likes-test-es",
        ]),
      );
  });

  afterAll(() => db.$client.end());

  it("reads zero without creating a counter", async () => {
    await expect(request("likes-test-first")).resolves.toEqual({ count: 0 });
    const rows = await db
      .select()
      .from(articleLikeCounts)
      .where(inArray(articleLikeCounts.articleSlug, ["likes-test-first"]));
    expect(rows).toEqual([]);
  });

  it("adds one per request and ignores client-supplied counts or slugs", async () => {
    await expect(request("likes-test-first", "POST")).resolves.toEqual({ count: 1 });
    await expect(
      request(
        "likes-test-first",
        "POST",
        JSON.stringify({ count: 100, slug: "likes-test-second" }),
      ),
    ).resolves.toEqual({ count: 2 });
    await expect(request("likes-test-first")).resolves.toEqual({ count: 2 });
    await expect(request("likes-test-second")).resolves.toEqual({ count: 0 });
  });

  it("keeps every simultaneous increment, including the initial insert", async () => {
    const results = await Promise.all(
      Array.from({ length: 40 }, () => request("likes-test-first", "POST")),
    );
    expect(results.map(({ count }) => count).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 1),
    );
    await expect(request("likes-test-first")).resolves.toEqual({ count: 40 });
  });

  it("accepts articles published in either locale and keeps their counters separate", async () => {
    await expect(request("likes-test-first", "POST")).resolves.toEqual({ count: 1 });
    await expect(request("likes-test-es", "POST")).resolves.toEqual({ count: 1 });
    await expect(request("likes-test-es", "POST")).resolves.toEqual({ count: 2 });
    await expect(request("likes-test-first")).resolves.toEqual({ count: 1 });
  });

  it("round-trips both procedures through the typed client", async () => {
    const client: RouterClient<typeof router> = createORPCClient(
      new OpenAPILink(contract, {
        url: "/api",
        origin: "http://localhost",
        fetch: async (url, init) => {
          const { response } = await handler.handle(new Request(url, init), {
            prefix: "/api",
            context: { headers: new Headers(), db },
          });
          return response!;
        },
      }),
    );

    await expect(client.articles.likes.get({ slug: "likes-test-first" })).resolves.toEqual({
      count: 0,
    });
    await expect(client.articles.likes.add({ slug: "likes-test-first" })).resolves.toEqual({
      count: 1,
    });
  });

  it("enforces nonnegative counts in PostgreSQL", async () => {
    await expect(
      db.insert(articleLikeCounts).values({ articleSlug: "likes-test-first", count: -1 }),
    ).rejects.toMatchObject({ cause: { code: "23514" } });
  });
});
