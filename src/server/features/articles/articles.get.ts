import "@tanstack/solid-start/server-only";
import { ORPCError } from "@orpc/server";
import { article_revision } from "@/lib/articles/article-metadata";
import { article_queryIndex } from "@/server/features/articles/article-index";
import { base } from "@/server/orpc/orpc.base";

export const getArticles = base.articles.get.handler(async ({ input, context }) => {
  const result = await article_queryIndex(context.db, article_revision, input);
  if (!result)
    throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Article catalogue not indexed" });
  return result;
});
