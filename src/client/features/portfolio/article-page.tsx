import { Link } from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Page, PageTitle } from "@/client/ui/page";
import { ToastProvider } from "@/client/ui/toast";
import { article_content } from "@/lib/articles/article-content";
import { ArticleDate } from "@/client/features/portfolio/article-date";
import { ArticleTags } from "@/client/features/portfolio/article-tags";
import { ArticleShare } from "@/client/features/portfolio/article-share";
import { ArticleLikeButton } from "@/client/features/portfolio/article-like-button";
import type { Article } from "@/lib/articles/article-metadata";
import { m } from "@/paraglide/messages";

export function ArticlePage(props: { article: Article }) {
  return (
    <ToastProvider>
      <Page class="min-w-0 max-w-[64ch]">
        <PageTitle>{props.article.title}</PageTitle>
        <div class="grid gap-2">
          <ArticleDate date={props.article.date} class="text-xs text-faint" />
          <ArticleTags tags={props.article.tags} />
        </div>
        <article class="article-body min-w-0">
          <Suspense fallback={<p role="status">Loading article…</p>}>
            <Dynamic component={article_content(props.article.slug)} />
          </Suspense>
        </article>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <Link to="/writing" class="text-xs">
            {m.article_all_writing()}
          </Link>
          <div class="ml-auto flex items-center gap-2">
            <ArticleLikeButton slug={props.article.slug} />
            <ArticleShare article={props.article} />
          </div>
        </div>
      </Page>
    </ToastProvider>
  );
}
