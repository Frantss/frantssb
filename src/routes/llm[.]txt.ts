import { createFileRoute } from "@tanstack/solid-router";
import { article_metadata } from "@/lib/articles/article-metadata";
import { cache_publicContent } from "@/shared/cache-control";
import { createLlmText } from "@/shared/seo/llm";

export const Route = createFileRoute("/llm.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(createLlmText(article_metadata), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": cache_publicContent,
          },
        }),
    },
  },
});
