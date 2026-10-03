import { createFileRoute } from "@tanstack/solid-router";
import { article_metadata } from "@/lib/articles/article-metadata";
import { cache_publicContent } from "@/shared/cache-control";
import { createSitemap } from "@/shared/seo/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(createSitemap(article_metadata), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": cache_publicContent,
          },
        }),
    },
  },
});
