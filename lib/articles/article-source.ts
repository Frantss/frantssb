import { readdir, readFile } from "node:fs/promises";
import { createProcessor } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { article_parseFrontmatter } from "@/lib/articles/article-frontmatter";
import { article_createManifest } from "@/lib/articles/article-manifest";

export const article_sourceDirectory = new URL("../../src/content/articles/", import.meta.url);

type TextNode = { type: string; value?: string; children?: TextNode[] };

export function article_extractText(source: string, format: "md" | "mdx" = "mdx") {
  const tree = createProcessor({ format, remarkPlugins: [remarkFrontmatter, remarkGfm] }).parse(
    source,
  );
  function text(node: TextNode): string {
    if (node.type === "text" || node.type === "inlineCode") return node.value ?? "";
    if (!node.children) return "";
    const separator = [
      "paragraph",
      "heading",
      "emphasis",
      "strong",
      "link",
      "delete",
      "mdxJsxTextElement",
    ].includes(node.type)
      ? ""
      : " ";
    return node.children.map(text).join(separator);
  }
  return text(tree).replace(/\s+/g, " ").trim();
}

export async function article_readSources(directory = article_sourceDirectory) {
  const filenames = (await readdir(directory)).filter((name) => /\.(md|mdx)$/.test(name)).sort();
  const sources = await Promise.all(
    filenames.map(async (filename) => {
      const source = await readFile(new URL(encodeURIComponent(filename), directory), "utf8");
      return {
        slug: filename.replace(/\.(md|mdx)$/, ""),
        frontmatter: article_parseFrontmatter(source, filename),
        bodyText: article_extractText(source, filename.endsWith(".mdx") ? "mdx" : "md"),
      };
    }),
  );
  const manifest = article_createManifest(
    sources.map(({ slug, frontmatter, bodyText }) => ({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      tags: frontmatter.tags,
      keywords: frontmatter.keywords ?? frontmatter.tags,
      language: frontmatter.language ?? "en",
      bodyText,
    })),
  );
  return { sources, manifest };
}
