import type { Post } from "@/content/post-metadata";
import { site } from "./site";

export function createSitemap(posts: readonly Pick<Post, "slug">[]) {
  const paths = [
    "/",
    "/work",
    "/projects",
    "/writing",
    ...posts.map((post) => `/writing/${encodeURIComponent(post.slug)}`),
  ];
  const urls = paths.map((path) => {
    const url = new URL(path, site.origin).href;
    return `  <url><loc>${escapeXml(url)}</loc></url>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
