import { createFileRoute, notFound } from "@tanstack/solid-router";
import { ArticlePage } from "@/client/features/portfolio/article-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { article_list } from "@/lib/articles/article-metadata";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { getLocale } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/writing/$slug")({
  loader: ({ params }) => {
    const article = article_list(getLocale()).find((candidate) => candidate.slug === params.slug);

    if (!article) throw notFound();

    return article;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return seo({
        title: `${m.page_writing()} · ${profile.name}`,
        description: m.meta_writing({ name: profile.name }),
        robots: "noindex",
      });
    }
    const metadata = seo({
      title: `${loaderData.title} · ${profile.name}`,
      description: loaderData.description,
      type: "article",
      path: `/writing/${encodeURIComponent(params.slug)}`,
      image: loaderData.socialImage,
      article: {
        headline: loaderData.title,
        datePublished: loaderData.date.replaceAll(".", "-"),
        author: { name: profile.name, url: `${site.origin}/` },
        keywords: loaderData.keywords,
      },
    });

    return { meta: metadata.meta, links: metadata.links, scripts: metadata.scripts };
  },
  component: ArticleRoute,
});

function ArticleRoute() {
  const article = Route.useLoaderData();
  const localizedArticle = () =>
    article_list(getLocale()).find((candidate) => candidate.slug === article().slug) ?? article();

  return <ArticlePage article={localizedArticle()} />;
}
