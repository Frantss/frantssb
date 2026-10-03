import { parse } from "yaml";

export type ArticleFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export function article_parseFrontmatter(source: string, path: string): ArticleFrontmatter {
  const yaml = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)?.[1];
  const frontmatter: unknown = yaml ? parse(yaml) : undefined;
  if (
    !frontmatter ||
    typeof frontmatter !== "object" ||
    !("title" in frontmatter) ||
    typeof frontmatter.title !== "string" ||
    !frontmatter.title.trim() ||
    !("description" in frontmatter) ||
    typeof frontmatter.description !== "string" ||
    !frontmatter.description.trim() ||
    !("date" in frontmatter) ||
    typeof frontmatter.date !== "string" ||
    !/^\d{4}\.\d{2}\.\d{2}$/.test(frontmatter.date)
  ) {
    throw new Error(`${path}: expected frontmatter title, description, and date (YYYY.MM.DD)`);
  }
  if (
    "tags" in frontmatter &&
    (!Array.isArray(frontmatter.tags) ||
      frontmatter.tags.some((tag) => typeof tag !== "string" || !tag.trim()))
  ) {
    throw new Error(`${path}: expected frontmatter tags to be a list of non-empty strings`);
  }
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    tags: "tags" in frontmatter ? (frontmatter.tags as string[]) : [],
  };
}
