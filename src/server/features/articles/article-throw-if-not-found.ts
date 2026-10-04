import "@tanstack/solid-start/server-only";
import { ORPCError } from "@orpc/server";
import { article_list } from "@/lib/articles/article-metadata";
import { locales } from "@/paraglide/runtime";

export function article_throwIfNotFound(slug: string) {
  if (!locales.some((locale) => article_list(locale).some((article) => article.slug === slug))) {
    throw new ORPCError("NOT_FOUND", { message: "Article not found" });
  }
}
