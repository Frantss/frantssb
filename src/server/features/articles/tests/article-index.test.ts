import { createORPCClient } from "@orpc/client";
import { OpenAPIHandler, OpenAPILink } from "@orpc/openapi/fetch";
import type { RouterClient } from "@orpc/server";
import { count, eq, inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test";
import { article_createManifest, type ArticleIndexEntry } from "@/lib/articles/article-manifest";
import { db } from "@/server/db/db";
import { articleCatalogues, articleIndex, articleLikeCounts } from "@/server/db/db.schema";
import { article_queryIndex, article_syncIndex } from "@/server/features/articles/article-index";
import { router } from "@/server/orpc/orpc.router";
import { contract } from "@/shared/orpc/orpc.contract";

const current = vi.hoisted(() => ({ revision: "" }));
vi.mock("@/lib/articles/article-metadata", () => ({
  get article_revision() {
    return current.revision;
  },
  article_list: () => [],
}));

const title: ArticleIndexEntry = {
  slug: "index-test-title",
  title: "Drizzle schema",
  description: "Fixture",
  date: "2026.10.01",
  tags: ["engineering"],
  keywords: ["database"],
  language: "en",
  bodyText: "Typed queries",
};
const body: ArticleIndexEntry = {
  ...title,
  slug: "index-test-body",
  title: "Building applications",
  date: "2026.10.03",
  tags: ["engineering", "log"],
  bodyText: "Using Drizzle",
};
const spanish: ArticleIndexEntry = {
  ...title,
  slug: "index-test-spanish",
  title: "Desarrollando aplicaciones",
  date: "2026.10.02",
  language: "es",
  tags: ["log"],
  keywords: [],
  bodyText: "Artículos en español",
};
const manifest = article_createManifest([title, body, spanish]);
const revisions = new Set<string>();

async function sync(articles = manifest.articles) {
  const input = article_createManifest(articles);
  revisions.add(input.revision);
  current.revision = input.revision;
  return article_syncIndex(db, input);
}

describe("article catalogue with PostgreSQL", () => {
  const handler = new OpenAPIHandler(router);
  const query = { limit: 20, offset: 0 };
  async function request(search = "") {
    const { response } = await handler.handle(
      new Request(`http://localhost/api/articles${search}`),
      {
        prefix: "/api",
        context: { headers: new Headers(), db },
      },
    );
    return response!;
  }

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: "./drizzle" });
  });
  afterEach(async () => {
    if (revisions.size)
      await db.delete(articleCatalogues).where(inArray(articleCatalogues.revision, [...revisions]));
    await db.delete(articleLikeCounts).where(eq(articleLikeCounts.articleSlug, title.slug));
    revisions.clear();
  });
  afterAll(() => db.$client.end());

  it("serializes concurrent imports and makes repeated imports a no-op", async () => {
    revisions.add(manifest.revision);
    const results = await Promise.all(
      Array.from({ length: 4 }, () => article_syncIndex(db, manifest)),
    );
    expect(results.filter(({ inserted }) => inserted)).toHaveLength(1);
    expect(await article_syncIndex(db, manifest)).toEqual({
      revision: manifest.revision,
      inserted: false,
    });
    const [{ total }] = await db
      .select({ total: count() })
      .from(articleIndex)
      .where(eq(articleIndex.revision, manifest.revision));
    expect(total).toBe(3);
  });

  it("rolls back a failed import and leaves existing catalogues intact", async () => {
    await sync();
    const broken = article_createManifest([
      { ...title, bodyText: "Invalid PostgreSQL text\u0000" },
    ]);
    revisions.add(broken.revision);
    await expect(article_syncIndex(db, broken)).rejects.toThrow();
    expect(await article_queryIndex(db, broken.revision, query)).toBeNull();
    expect((await article_queryIndex(db, manifest.revision, query))?.total).toBe(3);
  });

  it("records an empty catalogue and distinguishes it from a missing revision", async () => {
    await sync([]);
    expect(await article_queryIndex(db, current.revision, query)).toEqual({ items: [], total: 0 });
    expect((await request()).status).toBe(200);
    current.revision = "0".repeat(64);
    const response = await request();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("isolates revisions and retains likes when content changes or disappears", async () => {
    await db.insert(articleLikeCounts).values({ articleSlug: title.slug, count: 17 });
    await sync();
    await sync([{ ...title, title: "New title" }]);
    expect((await article_queryIndex(db, manifest.revision, query))?.total).toBe(3);
    expect((await article_queryIndex(db, current.revision, query))?.items[0].title).toBe(
      "New title",
    );
    await sync([]);
    const [likes] = await db
      .select()
      .from(articleLikeCounts)
      .where(eq(articleLikeCounts.articleSlug, title.slug));
    expect(likes.count).toBe(17);
  });

  it("filters tags, paginates, and reports the filtered total with stable date ordering", async () => {
    await sync();
    const response = await request("?tag=engineering&limit=1&offset=1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [
        {
          slug: title.slug,
          title: title.title,
          description: title.description,
          date: title.date,
          tags: title.tags,
        },
      ],
      total: 2,
    });
    expect(await (await request("?tag=missing")).json()).toEqual({ items: [], total: 0 });
  });

  it("ranks title matches above body matches and supports article-language stemming", async () => {
    await sync();
    const result = await (await request("?q=drizzle")).json();
    expect(result.items.map((article: { slug: string }) => article.slug)).toEqual([
      title.slug,
      body.slug,
    ]);
    expect(
      (await (await request("?q=desarrollar")).json()).items.map(
        (article: { slug: string }) => article.slug,
      ),
    ).toEqual([spanish.slug]);
    expect(
      (await (await request("?q=database&tag=log")).json()).items.map(
        (article: { slug: string }) => article.slug,
      ),
    ).toEqual([body.slug]);
    expect((await request("?q=%27%3B%20DROP%20TABLE%20article_index%3B--")).status).toBe(200);
  });

  it("round-trips the listing through the typed client and bounds query input", async () => {
    await sync();
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
    expect((await client.articles.get({ tag: "engineering" })).total).toBe(2);
    for (const search of [
      "?limit=0",
      "?limit=101",
      "?limit=1.5",
      "?offset=-1",
      "?offset=oops",
      `?q=${"a".repeat(201)}`,
      "?q=%20",
    ]) {
      expect((await request(search)).status, search).toBe(400);
    }
  });
});
