import { site } from "@/shared/seo/site";
import { getLocale } from "@/paraglide/runtime";
import { createJsonLd, type JsonLdOptions } from "@/shared/seo/json-ld";
import { article_createJsonLd, type ArticleJsonLdOptions } from "@/lib/articles/article-json-ld";

interface SocialImage {
  path: string;
  width: number;
  height: number;
  alt: string;
}

type SeoOptions = {
  title: string;
  description: string;
  robots?: string;
  type?: "website" | "article";
  jsonLd?: JsonLdOptions;
  article?: Omit<ArticleJsonLdOptions, "description" | "url" | "image">;
} & ({ path?: undefined } | { path: `/${string}`; image: SocialImage });

export function seo(options: SeoOptions) {
  const meta = [
    { title: options.title },
    { name: "description", content: options.description },
    ...(options.robots ? [{ name: "robots", content: options.robots }] : []),
  ];
  const scripts = options.jsonLd ? [jsonLdScript(createJsonLd(options.jsonLd))] : [];

  if (!options.path) return { meta, links: [], scripts };

  const canonicalUrl = new URL(options.path, site.origin).href;
  const { image } = options;
  const socialImageUrl = new URL(image.path, site.origin).href;
  const articleMeta = options.article
    ? [
        { name: "author", content: options.article.author.name },
        ...(options.article.keywords.length > 0
          ? [{ name: "keywords", content: options.article.keywords.join(", ") }]
          : []),
        { property: "article:author", content: options.article.author.url },
        { property: "article:published_time", content: options.article.datePublished },
      ]
    : [];

  if (options.article) {
    scripts.push(
      jsonLdScript(
        article_createJsonLd({
          ...options.article,
          description: options.description,
          url: canonicalUrl,
          image: socialImageUrl,
        }),
      ),
    );
  }

  return {
    meta: [
      ...meta,
      ...articleMeta,
      { property: "og:title", content: options.title },
      { property: "og:description", content: options.description },
      { property: "og:type", content: options.article ? "article" : (options.type ?? "website") },
      { property: "og:url", content: canonicalUrl },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: site.openGraphLocales[getLocale()] },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: String(image.width) },
      { property: "og:image:height", content: String(image.height) },
      { property: "og:image:alt", content: image.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: options.title },
      { name: "twitter:description", content: options.description },
      { name: "twitter:image", content: socialImageUrl },
      { name: "twitter:image:alt", content: image.alt },
    ],
    links: [{ rel: "canonical", href: canonicalUrl }],
    scripts,
  };
}

function jsonLdScript(data: object) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data).replaceAll("<", "\\u003c"),
  };
}
