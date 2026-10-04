import { lazy, type Component } from "solid-js";

const modules = import.meta.glob<{ default: Component }>("../../src/content/articles/*.{md,mdx}");
const components = new Map<string, Component>(
  Object.entries(modules).map(([path, load]) => {
    const slug = path.slice("../../src/content/articles/".length).replace(/\.(md|mdx)$/, "");

    return [slug, lazy(load)];
  }),
);

export function article_content(slug: string) {
  const Content = components.get(slug);

  if (!Content) throw new Error(`Unknown article: ${slug}`);

  return Content;
}
