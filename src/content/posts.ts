import { lazy, type Component } from "solid-js";

const modules = import.meta.glob<{ default: Component }>("./posts/*.{md,mdx}");
const components = new Map<string, Component>(
  Object.entries(modules).map(([path, load]) => {
    const slug = path.slice("./posts/".length).replace(/\.(md|mdx)$/, "");
    return [slug, lazy(load)];
  }),
);

export function post_content(slug: string) {
  const Content = components.get(slug);
  if (!Content) throw new Error(`Unknown post: ${slug}`);
  return Content;
}
