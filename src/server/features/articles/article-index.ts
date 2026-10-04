import { and, arrayContains, count, desc, eq, or, sql } from "drizzle-orm";
import {
  db_fullTextMatches,
  db_fullTextQuery,
  db_fullTextRank,
  db_fullTextVector,
} from "@/lib/db/db-full-text";
import { article_parseManifest } from "@/lib/articles/article-manifest";
import type { db } from "@/server/db/db";
import { articleCatalogues, articleIndex } from "@/server/db/db.schema";
import type { article_querySchema } from "@/shared/features/articles/articles.get.contract";
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
            searchVector: db_fullTextVector(config, [
              { text: article.title, weight: "A" },
              { text: article.description + " " + article.keywords.join(" "), weight: "B" },
              { text: article.bodyText, weight: "D" },
            ]),
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
  const search = input.q
    ? {
        english: db_fullTextQuery("english", input.q),
        spanish: db_fullTextQuery("spanish", input.q),
        localized: db_fullTextQuery(
          sql`case ${articleIndex.language} when 'es' then 'spanish' else 'english' end`,
          input.q,
        ),
      }
    : undefined;
  const where = and(
    eq(articleIndex.revision, revision),
    input.tag ? arrayContains(articleIndex.tags, [input.tag]) : undefined,
    search
      ? or(
          and(
            eq(articleIndex.language, "en"),
            db_fullTextMatches(articleIndex.searchVector, search.english),
          ),
          and(
            eq(articleIndex.language, "es"),
            db_fullTextMatches(articleIndex.searchVector, search.spanish),
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
      ...(search ? [desc(db_fullTextRank(articleIndex.searchVector, search.localized))] : []),
      desc(articleIndex.publishedAt),
      articleIndex.slug,
    )
    .limit(input.limit)
    .offset(input.offset);

  return { items, total };
}
