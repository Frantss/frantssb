import metadata from "virtual:article-metadata";

export type Article = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  keywords: string[];
  socialImage: { path: string; width: number; height: number; alt: string };
};

export const article_revision = metadata.revision;
export const article_metadata = metadata.articles;

export function article_list(): Article[] {
  return article_metadata;
}
