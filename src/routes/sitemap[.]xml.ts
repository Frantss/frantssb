import { createFileRoute } from "@tanstack/solid-router";
import { posts } from "@/content/post-metadata";
import { cache_publicContent } from "@/shared/cache-control";
import { createSitemap } from "@/shared/seo/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(createSitemap(posts), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": cache_publicContent,
          },
        }),
    },
  },
});
