import { keepPreviousData } from "@tanstack/solid-query";
import * as v from "valibot";
import { orpc } from "@/client/orpc/orpc.query";
import { article_querySchema } from "@/shared/features/articles/articles.get.contract";

export type ArticleSearch = { q?: string; tag?: string; offset?: number };

const searchSchema = v.object({
  q: v.fallback(article_querySchema.entries.q, undefined),
  tag: v.fallback(article_querySchema.entries.tag, undefined),
  offset: v.fallback(article_querySchema.entries.offset, 0),
});

export function article_parseSearch(input: unknown): ArticleSearch {
  const search = v.parse(searchSchema, input);

  return { q: search.q, tag: search.tag, offset: search.offset || undefined };
}

export function article_searchQueryOptions(search: ArticleSearch) {
  return orpc.articles.get.queryOptions({
    input: { q: search.q, tag: search.tag, offset: search.offset ?? 0, limit: 20 },
    placeholderData: keepPreviousData,
    retry: false,
    throwOnError: false,
  });
}
