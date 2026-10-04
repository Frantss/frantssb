import { orpc } from "@/client/orpc/orpc.query";

export function article_likesQueryOptions(slug: string) {
  return orpc.articles.likes.get.queryOptions({
    input: { slug },
    retry: false,
    throwOnError: true,
  });
}
