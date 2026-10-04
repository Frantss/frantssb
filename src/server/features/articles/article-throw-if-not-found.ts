import "@tanstack/solid-start/server-only";
import { ORPCError } from "@orpc/server";
import { article_list } from "@/lib/articles/article-metadata";

export function article_throwIfNotFound(slug: string) {
  if (!article_list().some((article) => article.slug === slug)) {
    throw new ORPCError("NOT_FOUND", { message: "Article not found" });
  }
}
