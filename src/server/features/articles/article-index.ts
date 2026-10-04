import { and, arrayContains, count, desc, eq, or, sql } from "drizzle-orm";
import { article_parseManifest } from "@/lib/articles/article-manifest";
import type { db } from "@/server/db/db";
import { articleCatalogues, articleIndex } from "@/server/db/db.schema";
import type { article_querySchema } from "@/shared/orpc/orpc.contract";
import type * as v from "valibot";

type Database = typeof db;
type ArticleQuery = v.InferOutput<typeof article_querySchema>;

export async function article_syncIndex(database: Database, input: unknown) {
  const manifest = article_parseManifest(input);
  const inserted = await database.transaction(async (tx) => {
    const created = await tx
      .insert(articleCatalogues)
      .values({
        revision: manifest.revision,
        articleCount: manifest.articles.length,
      })
      .onConflictDoNothing()
      .returning({ revision: articleCatalogues.revision });
    if (!created.length) return false;
    for (let offset = 0; offset < manifest.articles.length; offset += 200) {
      await tx.insert(articleIndex).values(
        manifest.articles.slice(offset, offset + 200).map((article) => {
          const config = article.language === "es" ? "spanish" : "english";
          return {
            revision: manifest.revision,
            slug: article.slug,
            title: article.title,
            description: article.description,
            publishedAt: article.date.replaceAll(".", "-"),
            tags: article.tags,
            keywords: article.keywords,
            language: article.language,
            bodyText: article.bodyText,
            searchVector: sql`setweight(to_tsvector(${config}::regconfig, ${article.title}), 'A') || setweight(to_tsvector(${config}::regconfig, ${article.description + " " + article.keywords.join(" ")}), 'B') || setweight(to_tsvector(${config}::regconfig, ${article.bodyText}), 'D')`,
          };
        }),
      );
    }
    return true;
  });
  return { revision: manifest.revision, inserted };
}

export async function article_queryIndex(
  database: Database,
  revision: string,
  input: ArticleQuery,
) {
  const [catalogue] = await database
    .select({ revision: articleCatalogues.revision })
    .from(articleCatalogues)
    .where(eq(articleCatalogues.revision, revision));
  if (!catalogue) return null;
  const englishQuery = input.q ? sql`websearch_to_tsquery('english', ${input.q})` : undefined;
  const spanishQuery = input.q ? sql`websearch_to_tsquery('spanish', ${input.q})` : undefined;
  const query = input.q
    ? sql`websearch_to_tsquery(case ${articleIndex.language} when 'es' then 'spanish'::regconfig else 'english'::regconfig end, ${input.q})`
    : undefined;
  const where = and(
    eq(articleIndex.revision, revision),
    input.tag ? arrayContains(articleIndex.tags, [input.tag]) : undefined,
    query
      ? or(
          and(
            eq(articleIndex.language, "en"),
            sql`${articleIndex.searchVector} @@ ${englishQuery}`,
          ),
          and(
            eq(articleIndex.language, "es"),
            sql`${articleIndex.searchVector} @@ ${spanishQuery}`,
          ),
        )
      : undefined,
  );
  const [{ total }] = await database.select({ total: count() }).from(articleIndex).where(where);
  const items = await database
    .select({
      slug: articleIndex.slug,
      title: articleIndex.title,
      description: articleIndex.description,
      date: sql<string>`to_char(${articleIndex.publishedAt}, 'YYYY.MM.DD')`,
      tags: articleIndex.tags,
    })
    .from(articleIndex)
    .where(where)
    .orderBy(
      ...(query ? [desc(sql`ts_rank(${articleIndex.searchVector}, ${query})`)] : []),
      desc(articleIndex.publishedAt),
      articleIndex.slug,
    )
    .limit(input.limit)
    .offset(input.offset);
  return { items, total };
}
