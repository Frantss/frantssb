import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import {
  article_createManifest,
  article_parseManifest,
  type ArticleIndexEntry,
} from "@/lib/articles/article-manifest";
import type { article_readSources } from "@/lib/articles/article-source";

const runNode = promisify(execFile);
async function sourceCall(method: "extract" | "read", args: string[]) {
  const { stdout } = await runNode(
    process.execPath,
    [
      "--import=tsx",
      "--input-type=module",
      "-e",
      `
    import { article_extractText, article_readSources } from '@/lib/articles/article-source';
    const [method, args] = JSON.parse(process.argv[1]);
    try {
      const result = method === 'extract' ? article_extractText(...args) : await article_readSources(new URL(args[0]));
      console.log(JSON.stringify({ result }));
    } catch (error) {
      console.log(JSON.stringify({ error: error.message }));
    }
  `,
      JSON.stringify([method, args]),
    ],
    { cwd: fileURLToPath(new URL("../../../", import.meta.url)) },
  );
  const output = JSON.parse(stdout) as { result: unknown; error?: string };
  if (output.error) throw new Error(output.error);
  return output.result;
}

async function readSources(directory: URL) {
  return (await sourceCall("read", [directory.href])) as Awaited<
    ReturnType<typeof article_readSources>
  >;
}

const article: ArticleIndexEntry = {
  slug: "hello",
  title: "Hello",
  description: "Description",
  date: "2026.10.03",
  tags: ["engineering"],
  keywords: ["typescript"],
  language: "en",
  bodyText: "Hello world",
};

describe("article manifests", () => {
  it("produces the same revision regardless of discovery order and detects content changes", () => {
    const second = { ...article, slug: "second" };
    const first = article_createManifest([article, second]);
    expect(article_createManifest([second, article])).toEqual(first);
    expect(article_createManifest([{ ...article, bodyText: "Changed" }, second]).revision).not.toBe(
      first.revision,
    );
    expect(article_parseManifest(JSON.parse(JSON.stringify(first)))).toEqual(first);
    const spaced = { ...article, slug: " hello ", description: " Description " };
    expect(article_createManifest([spaced]).articles).toEqual([spaced]);
    expect(() => article_parseManifest({ ...first, articles: [] })).toThrow("revision mismatch");
  });

  it("validates calendar dates, language, duplicate slugs, and manifest versions", () => {
    expect(() => article_createManifest([article, article])).toThrow("Duplicate article slug");
    expect(() => article_createManifest([{ ...article, date: "2026.02.30" }])).toThrow(
      "calendar date",
    );
    expect(() => article_parseManifest({ ...article_createManifest([]), version: 2 })).toThrow();
    expect(() => article_createManifest([{ ...article, language: "fr" as "en" }])).toThrow();
  });

  it("indexes prose and inline code without imports, expressions, attributes, or code blocks", async () => {
    const source = [
      "---",
      "title: Hidden frontmatter",
      "---",
      "",
      "import Secret from './hidden.js'",
      "",
      "export const secret = 'hidden export'",
      "",
      "# Hello **world**",
      "",
      "Use `Drizzle` and [links](https://hidden.example).",
      "",
      '<Callout label="hidden attribute">Visible text {"hidden expression"}</Callout>',
      "",
      "```ts",
      "const hiddenCode = true",
      "```",
      "",
      "<Secret />",
    ].join("\n");
    expect(await sourceCall("extract", [source])).toBe(
      "Hello world Use Drizzle and links. Visible text",
    );
    expect(await sourceCall("extract", ["Plain {text}", "md"])).toBe("Plain {text}");
  });

  it("reads an empty directory and rejects filenames that produce duplicate slugs", async () => {
    const directory = await mkdtemp(join(tmpdir(), "article-manifest-"));
    try {
      const url = pathToFileURL(`${directory}/`);
      expect((await readSources(url)).manifest).toEqual(article_createManifest([]));
      const source = '---\ntitle: Hello\ndescription: Description\ndate: "2026.10.03"\n---\nHello';
      await writeFile(join(directory, "hello.md"), source);
      expect((await readSources(url)).manifest.articles[0]).toMatchObject({
        slug: "hello",
        language: "en",
        keywords: [],
      });
      await writeFile(join(directory, "hello.mdx"), source);
      await expect(readSources(url)).rejects.toThrow("Duplicate article slug");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
