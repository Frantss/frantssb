import { createFileRoute, notFound } from "@tanstack/solid-router";
import { PostPage } from "@/client/features/portfolio/post-page";
import { portfolio_posts, profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { useLocale } from "@/client/features/localization/locale.context";
import { getLocale } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/writing/$slug")({
  loader: ({ params }) => {
    const post = portfolio_posts(getLocale()).find((candidate) => candidate.slug === params.slug);
    if (!post) throw notFound();
    return post;
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
      image: site.socialImage,
      article: {
        headline: loaderData.title,
        datePublished: loaderData.date.replaceAll(".", "-"),
        author: { name: profile.name, url: `${site.origin}/` },
        keywords: loaderData.tags,
      },
    });
    return { meta: metadata.meta, links: metadata.links, scripts: metadata.scripts };
  },
  component: PostRoute,
});

function PostRoute() {
  const locale = useLocale();
  const post = Route.useLoaderData();
  const localizedPost = () =>
    portfolio_posts(locale()).find((candidate) => candidate.slug === post().slug) ?? post();
  return <PostPage post={localizedPost()} />;
}
