import { readdir, readFile, rm } from "node:fs/promises";
import { article_parseFrontmatter } from "@/lib/articles/article-frontmatter";
import {
  article_generateSocialImage,
  article_socialDirectory,
} from "@/lib/articles/article-social-image";

const directory = new URL("../src/content/articles/", import.meta.url);
const filenames = (await readdir(directory))
  .filter((filename) => /\.(md|mdx)$/.test(filename))
  .sort();
const slugs = new Set<string>();
const articles = await Promise.all(
  filenames.map(async (filename) => {
    const slug = filename.replace(/\.(md|mdx)$/, "");
    if (slugs.has(slug)) throw new Error(`${filename}: duplicate article slug ${slug}`);
    slugs.add(slug);
    return {
      slug,
      frontmatter: article_parseFrontmatter(
        await readFile(new URL(encodeURIComponent(filename), directory), "utf8"),
        filename,
      ),
    };
  }),
);

await rm(article_socialDirectory, { recursive: true, force: true });
for (const article of articles)
  await article_generateSocialImage(article.frontmatter, article.slug);
console.log(`Generated ${articles.length} article social image(s).`);
