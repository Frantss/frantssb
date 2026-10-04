import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Renderer, type Node } from "@takumi-rs/core";
import { site } from "@/shared/seo/site";
import type { ArticleFrontmatter } from "@/lib/articles/article-frontmatter";

export const article_socialDirectory = new URL(
  "../../.generated/social/articles/",
  import.meta.url,
);

let rendererPromise: Promise<Renderer> | undefined;

function article_getRenderer() {
  return (rendererPromise ??= (async () => {
    const renderer = new Renderer();

    await renderer.registerFont({
      name: "Geist Mono",
      data: await readFile(
        new URL(
          import.meta
            .resolve("@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2"),
        ),
      ),
    });

    return renderer;
  })());
}

async function article_fitText(
  renderer: Renderer,
  text: string,
  sizes: number[],
  maxHeight: number,
  weight: number,
): Promise<Node> {
  for (const fontSize of sizes) {
    const node: Node = {
      type: "text",
      text,
      style: {
        width: 1036,
        fontFamily: "Geist Mono",
        fontSize,
        fontWeight: weight,
        lineHeight: 1.15,
        overflowWrap: "anywhere",
      },
    };
    const measured = await renderer.measure(node, { width: 1200, height: 630 });

    if (measured.height <= maxHeight && measured.runs.every((run) => run.x + run.width <= 1037))
      return node;
  }
  throw new Error(`Social image text does not fit: ${text}`);
}

export async function article_renderSocialImage(article: ArticleFrontmatter, slug: string) {
  const renderer = await article_getRenderer();
  const title = await article_fitText(
    renderer,
    article.title,
    [64, 60, 56, 52, 48, 44, 40, 36, 32],
    212,
    700,
  );
  const tags = article.tags.slice(0, 3).join(" · ");
  const tagNode = tags
    ? await article_fitText(renderer, tags, [24, 22, 20, 18, 16], 30, 400)
    : undefined;
  const node: Node = {
    type: "container",
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      padding: 32,
      backgroundColor: "#fafafa",
      color: "#171717",
      fontFamily: "Geist Mono",
    },
    children: [
      {
        type: "container",
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          border: "2px solid #cccccc",
          padding: 48,
          justifyContent: "space-between",
        },
        children: [
          {
            type: "container",
            style: { display: "flex", alignItems: "center", gap: 20 },
            children: [
              {
                type: "container",
                style: {
                  width: 64,
                  height: 64,
                  display: "grid",
                  placeItems: "center",
                  border: "2px solid #737373",
                  fontSize: 28,
                  fontWeight: 700,
                },
                children: [{ type: "text", text: "FB" }],
              },
              { type: "text", text: site.name, style: { fontSize: 26, fontWeight: 700 } },
            ],
          },
          {
            type: "container",
            style: { display: "flex", flexDirection: "column", gap: 16 },
            children: [
              title,
              { type: "text", text: article.date, style: { fontSize: 24, color: "#4d4d4d" } },
              ...(tagNode ? [{ ...tagNode, style: { ...tagNode.style, color: "#4d4d4d" } }] : []),
            ],
          },
          {
            type: "container",
            style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
            children: [
              {
                type: "text",
                text: "Francisco Bongiovanni",
                style: { fontSize: 22, color: "#4d4d4d" },
              },
              {
                type: "text",
                text: new URL(site.origin).host,
                style: { fontSize: 26, color: "#6d28d9" },
              },
            ],
          },
        ],
      },
    ],
  };
  const png = await renderer.render(node, { width: 1200, height: 630, format: "png" });
  const hash = createHash("sha256").update(png).digest("hex").slice(0, 20);
  const filename = `${slug}-${hash}.png`;

  return {
    png,
    filename,
    image: {
      path: `/og/articles/${encodeURIComponent(filename)}`,
      width: 1200,
      height: 630,
      alt: `${article.title}. Francisco Bongiovanni. ${new URL(site.origin).host}`,
    },
  };
}

const generated = new Map<string, Promise<Awaited<ReturnType<typeof article_renderSocialImage>>>>();

export async function article_generateSocialImage(article: ArticleFrontmatter, slug: string) {
  const key = JSON.stringify([slug, article]);
  let pending = generated.get(key);

  if (!pending) {
    pending = article_renderSocialImage(article, slug);
    generated.set(key, pending);
  }
  const result = await pending;

  await mkdir(article_socialDirectory, { recursive: true });
  await writeFile(
    new URL(encodeURIComponent(result.filename), article_socialDirectory),
    result.png,
  );

  return result.image;
}
