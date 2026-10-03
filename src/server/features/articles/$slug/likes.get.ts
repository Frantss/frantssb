import "@tanstack/solid-start/server-only";
import { eq } from "drizzle-orm";
import { articleLikeCounts } from "@/server/db/db.schema";
import { requireArticle } from "@/server/features/articles/require-article";
import { base } from "@/server/orpc/orpc.base";

export const getArticleLikes = base.articles.likes.get.handler(async ({ input, context }) => {
  requireArticle(input.slug);
  const [counter] = await context.db
    .select({ count: articleLikeCounts.count })
    .from(articleLikeCounts)
    .where(eq(articleLikeCounts.articleSlug, input.slug));

  return { count: counter?.count ?? 0 };
});
