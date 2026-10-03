import { lazy, type Component } from "solid-js";

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
};

type PostFrontmatter = Omit<Post, "slug" | "tags"> & { tags?: string[] };

const metadata = import.meta.glob<PostFrontmatter>("./posts/*.{md,mdx}", {
  eager: true,
  query: "?frontmatter",
  import: "default",
});
const modules = import.meta.glob<{ default: Component }>("./posts/*.{md,mdx}");
const components = new Map<string, Component>();

export const posts: Post[] = Object.entries(metadata)
  .map(([path, frontmatter]) => {
    const slug = path.slice("./posts/".length).replace(/\.(md|mdx)$/, "");
    if (components.has(slug)) throw new Error(`${path}: duplicate post slug ${slug}`);
    components.set(slug, lazy(modules[path]!));
    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      description: frontmatter.description,
      tags: frontmatter.tags ?? [],
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export function post_content(slug: string) {
  const Content = components.get(slug);
  if (!Content) throw new Error(`Unknown post: ${slug}`);
  return Content;
}
