export interface ArticleJsonLdOptions {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  author: { name: string; url: string };
  keywords: readonly string[];
}

export function article_createJsonLd(article: ArticleJsonLdOptions) {
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
