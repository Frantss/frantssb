import { mkdir, rm, writeFile } from "node:fs/promises";
import { article_readSources } from "@/lib/articles/article-source";
import {
  article_generateSocialImage,
  article_socialDirectory,
} from "@/lib/articles/article-social-image";
import type { Article } from "@/lib/articles/article-metadata";

export const article_manifestDirectory = new URL("../../.generated/articles/", import.meta.url);

export async function article_generate() {
  const { sources, manifest } = await article_readSources();

  await rm(article_socialDirectory, { recursive: true, force: true });
  const articles: Article[] = await Promise.all(
    sources.map(async ({ slug, frontmatter }) => ({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      tags: frontmatter.tags,
      keywords: frontmatter.keywords ?? frontmatter.tags,
      socialImage: await article_generateSocialImage(frontmatter, slug),
    })),
  );

  articles.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const metadata = { revision: manifest.revision, articles };

  await mkdir(article_manifestDirectory, { recursive: true });
  await writeFile(new URL("catalogue.json", article_manifestDirectory), JSON.stringify(manifest));
  await writeFile(new URL("metadata.json", article_manifestDirectory), JSON.stringify(metadata));

  return { metadata, manifest };
}
