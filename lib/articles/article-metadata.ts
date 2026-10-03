import { baseLocale, type Locale } from "@/paraglide/runtime";

export type Article = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  keywords: string[];
  socialImage: { path: string; width: number; height: number; alt: string };
};

type ArticleFrontmatter = Omit<Article, "slug" | "tags" | "keywords"> & {
  tags?: string[];
  keywords?: string[];
};

const metadata = import.meta.glob<ArticleFrontmatter>("../../src/content/articles/*.{md,mdx}", {
  eager: true,
  query: "?frontmatter",
  import: "default",
});
const slugs = new Set<string>();

export const article_metadata: Article[] = Object.entries(metadata)
  .map(([path, frontmatter]) => {
    const slug = path.slice("../../src/content/articles/".length).replace(/\.(md|mdx)$/, "");
    if (slugs.has(slug)) throw new Error(`${path}: duplicate article slug ${slug}`);
    slugs.add(slug);
    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      description: frontmatter.description,
      tags: frontmatter.tags ?? [],
      keywords: frontmatter.keywords ?? frontmatter.tags ?? [],
      socialImage: frontmatter.socialImage,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export function article_list(_locale: Locale = baseLocale): Article[] {
  return article_metadata;
}
