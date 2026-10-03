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
const slugs = new Set<string>();

export const posts: Post[] = Object.entries(metadata)
  .map(([path, frontmatter]) => {
    const slug = path.slice("./posts/".length).replace(/\.(md|mdx)$/, "");
    if (slugs.has(slug)) throw new Error(`${path}: duplicate post slug ${slug}`);
    slugs.add(slug);
    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      description: frontmatter.description,
      tags: frontmatter.tags ?? [],
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));
