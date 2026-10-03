import { getLocale } from "@/paraglide/runtime";
import { site } from "@/shared/seo/site";

export interface JsonLdOptions {
  name: string;
  alternateName: string;
  description: string;
  jobTitle: string;
  email: string;
  sameAs: string[];
}

export interface ArticleJsonLdOptions {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  author: { name: string; url: string };
  keywords: readonly string[];
}

export function createArticleJsonLd(article: ArticleJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${article.url}#article`,
    url: article.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
    headline: article.headline,
    description: article.description,
    image: [article.image],
    datePublished: article.datePublished,
    author: { "@type": "Person", "@id": `${article.author.url}#person`, ...article.author },
    ...(article.keywords.length > 0 ? { keywords: article.keywords } : {}),
  } as const;
}

export function createJsonLd(person: JsonLdOptions) {
  const url = `${site.origin}/`;
  const personId = `${url}#person`;
  const websiteId = `${url}#website`;
  const language = getLocale();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        url,
        ...person,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url,
        name: site.name,
        alternateName: person.name,
        inLanguage: language,
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: person.name,
        inLanguage: language,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
      },
    ],
  } as const;
}
