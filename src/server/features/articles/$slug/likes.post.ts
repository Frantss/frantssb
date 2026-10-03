import "@tanstack/solid-start/server-only";
import { sql } from "drizzle-orm";
import { articleLikeCounts } from "@/server/db/db.schema";
import { requireArticle } from "@/server/features/articles/require-article";
import { base } from "@/server/orpc/orpc.base";

export const addArticleLike = base.articles.likes.add.handler(async ({ input, context }) => {
  requireArticle(input.slug);
  const [counter] = await context.db
    .insert(articleLikeCounts)
    .values({ articleSlug: input.slug, count: 1 })
    .onConflictDoUpdate({
      target: articleLikeCounts.articleSlug,
      set: { count: sql`${articleLikeCounts.count} + 1` },
    })
    .returning({ count: articleLikeCounts.count });

  return counter;
});
