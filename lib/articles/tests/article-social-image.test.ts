import { describe, expect, it } from "vite-plus/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  article_parseFrontmatter,
  type ArticleFrontmatter,
} from "@/lib/articles/article-frontmatter";

const runNode = promisify(execFile);

async function article_renderSocialImage(article: ArticleFrontmatter, slug: string) {
  const { stdout } = await runNode(
    process.execPath,
    [
      "--import=tsx",
      "--input-type=module",
      "-e",
      `
    import { article_renderSocialImage } from '@/lib/articles/article-social-image';
    const [article, slug] = JSON.parse(process.argv[1]);
    try {
      const result = await article_renderSocialImage(article, slug);
      console.log(JSON.stringify({ image: result.image, png: result.png.toString('base64') }));
    } catch (error) {
      console.log(JSON.stringify({ error: error.message }));
    }
  `,
      JSON.stringify([article, slug]),
    ],
    { cwd: fileURLToPath(new URL("../../../", import.meta.url)) },
  );
  const result = JSON.parse(stdout) as {
    error?: string;
    png: string;
    image: { path: string; alt: string };
  };
  if (result.error) throw new Error(result.error);
  return { image: result.image, png: Buffer.from(result.png, "base64") };
}

const article = {
  title: "Hello world",
  description: "An article.",
  date: "2026.10.03",
  tags: ["solid", "mdx"],
};

describe("article social images", () => {
  it("renders a deterministic PNG and changes its URL when displayed content changes", async () => {
    const original = await article_renderSocialImage(article, "hello-world");
    const repeated = await article_renderSocialImage(article, "hello-world");
    expect(original.png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(original.png.readUInt32BE(16)).toBe(1200);
    expect(original.png.readUInt32BE(20)).toBe(630);
    expect(repeated.png).toEqual(original.png);
    expect(repeated.image.path).toBe(original.image.path);
    for (const change of [
      { title: "A different title" },
      { date: "2026.10.04" },
      { tags: ["typescript"] },
    ]) {
      const changed = await article_renderSocialImage({ ...article, ...change }, "hello-world");
      expect(changed.image.path).not.toBe(original.image.path);
    }
  });

  it("fits long accented titles and supports articles without tags", async () => {
    const title =
      "Cómo escribir artículos con Markdown y MDX en una aplicación de TanStack Start sin perder el renderizado en el servidor";
    const result = await article_renderSocialImage(
      { ...article, title, tags: [] },
      "artículo & mdx",
    );
    expect(result.image.path).toMatch(
      /^\/og\/articles\/art%C3%ADculo%20%26%20mdx-[a-f0-9]{20}\.png$/,
    );
    expect(result.image.alt).toContain(title);
    expect(result.png.readUInt32BE(20)).toBe(630);
  });

  it("fails generation when the title cannot fit at a readable size", async () => {
    await expect(
      article_renderSocialImage({ ...article, title: "Very long title ".repeat(100) }, "too-long"),
    ).rejects.toThrow("Social image text does not fit");
  });
});

describe("article frontmatter validation", () => {
  it("normalizes optional tags and preserves article metadata", () => {
    expect(
      article_parseFrontmatter(
        '---\ntitle: Article\ndescription: Description\ndate: "2026.10.03"\n---\nContent',
        "article.mdx",
      ),
    ).toEqual({ title: "Article", description: "Description", date: "2026.10.03", tags: [] });
  });

  it("rejects invalid frontmatter before image generation", () => {
    expect(() => article_parseFrontmatter("No frontmatter", "article.mdx")).toThrow(
      "article.mdx: expected frontmatter",
    );
    expect(() =>
      article_parseFrontmatter(
        '---\ntitle: Article\ndescription: Description\ndate: "2026.10.03"\ntags: mdx\n---',
        "article.mdx",
      ),
    ).toThrow("expected frontmatter tags");
  });

  it("preserves keywords separately from tags and validates their format", () => {
    const source =
      '---\ntitle: Article\ndescription: Description\ndate: "2026.10.03"\ntags: [log]\n';
    expect(
      article_parseFrontmatter(
        `${source}keywords: [software engineering, web portfolio]\n---`,
        "article.mdx",
      ),
    ).toMatchObject({ tags: ["log"], keywords: ["software engineering", "web portfolio"] });
    expect(article_parseFrontmatter(`${source}keywords: []\n---`, "article.mdx").keywords).toEqual(
      [],
    );
    for (const keywords of ["mdx", '["", 7]', "[null]", '[" "]']) {
      expect(() =>
        article_parseFrontmatter(`${source}keywords: ${keywords}\n---`, "article.mdx"),
      ).toThrow("expected frontmatter keywords to be a list of non-empty strings");
    }
  });
});
