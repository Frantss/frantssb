import type { Article } from "@/lib/articles/article-metadata";
import { site } from "@/shared/seo/site";

export function createLlmText(
  articles: readonly Pick<Article, "slug" | "title" | "description">[],
) {
  const pages = [
    [
      "About",
      "/",
      "About Francisco Bongiovanni, a product engineer and fullstack developer in Uruguay.",
    ],
    [
      "Work",
      "/work",
      "Work history in product engineering, fullstack development, and technical leadership.",
    ],
    ["Education", "/education", "Education and qualifications."],
    ["Projects", "/projects", "Open-source libraries, client websites, and other projects."],
    ["Writing", "/writing", "Articles by Francisco Bongiovanni."],
    ["CV", "/cv", "Professional experience, technical skills, education, and projects."],
  ];
  const lines = [
    `# ${site.name}`,
    "",
    "> Personal website with an about page, work history, projects, and writing.",
    "",
    "## Pages",
    "",
    ...pages.map(
      ([title, path, description]) =>
        `- [${title}](${new URL(path, site.origin).href}): ${description}`,
    ),
  ];

  if (articles.length) {
    lines.push(
      "",
      "## Articles",
      "",
      ...articles.map((article) => {
        const url = new URL(`/writing/${encodeURIComponent(article.slug)}`, site.origin).href;

        return `- [${article.title.replaceAll("[", "\\[").replaceAll("]", "\\]")}](${url}): ${article.description}`;
      }),
    );
  }

  return [...lines, ""].join("\n");
}
