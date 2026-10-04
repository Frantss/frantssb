import { Link } from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Page, PageTitle } from "@/client/ui/page";
import { article_content } from "@/lib/articles/article-content";
import { ArticleDate } from "@/client/features/portfolio/article-date";
import { ArticleTags } from "@/client/features/portfolio/article-tags";
import { ArticleShare } from "@/client/features/portfolio/article-share";
import type { Article } from "@/lib/articles/article-metadata";
import { m } from "@/paraglide/messages";

export function ArticlePage(props: { article: Article }) {
  return (
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
      <div class="flex items-center justify-between gap-4">
        <Link to="/writing" class="text-xs">
          {m.article_all_writing()}
        </Link>
        <ArticleShare article={props.article} />
      </div>
    </Page>
  );
}
