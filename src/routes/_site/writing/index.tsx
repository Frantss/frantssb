import { createFileRoute } from "@tanstack/solid-router";
import { WritingPage } from "@/client/features/portfolio/writing-page";
import { article_likesQueryOptions } from "@/client/features/portfolio/article-likes.query";
import {
  article_parseSearch,
  article_searchQueryOptions,
} from "@/client/features/portfolio/articles.query";
import { article_list } from "@/lib/articles/article-metadata";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/writing/")({
  validateSearch: article_parseSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    if (!article_list().length) return;
    const options = article_searchQueryOptions(deps);

    await context.queryClient.prefetchQuery(options);
    const result = context.queryClient.getQueryData(options.queryKey);

    await Promise.all(
      (result?.items ?? []).map((article) =>
        context.queryClient.prefetchQuery(article_likesQueryOptions(article.slug)),
      ),
    );
  },
  head: () => {
    const metadata = seo({
      title: `${m.page_writing()} · ${profile.name}`,
      description: m.meta_writing({ name: profile.name }),
      path: "/writing",
      image: site.socialImage,
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: WritingPage,
});
