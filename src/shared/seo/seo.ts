import { site } from "@/shared/seo/site";

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
} & ({ path?: undefined } | { path: `/${string}`; image: SocialImage });

export function seo(options: SeoOptions) {
  const meta = [
    { title: options.title },
    { name: "description", content: options.description },
    ...(options.robots ? [{ name: "robots", content: options.robots }] : []),
  ];
  if (!options.path) return { meta, links: [] };

  const canonicalUrl = new URL(options.path, site.origin).href;
  const { image } = options;
  const socialImageUrl = new URL(image.path, site.origin).href;

  return {
    meta: [
      ...meta,
      { property: "og:title", content: options.title },
      { property: "og:description", content: options.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: site.openGraphLocale },
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
  };
}
