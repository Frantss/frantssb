import { Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { ArticleDate } from "@/client/features/portfolio/article-date";
import { ArticleTags } from "@/client/features/portfolio/article-tags";
import { article_list } from "@/lib/articles/article-metadata";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { analytics_autocapture } from "@/client/analytics/analytics";

export function WritingPage() {
  const articles = () => article_list(getLocale());

  return (
    <Page>
      <PageTitle>{m.page_writing()}</PageTitle>
      <Show
        when={articles().length > 0}
        fallback={<p class="m-0 text-muted">{m.writing_empty()}</p>}
      >
        <IndexList.Root>
          <For each={articles()}>
            {(article) => (
              <IndexList.Row>
                <div class="grid min-w-0 gap-1.5">
                  <Link
                    to="/writing/$slug"
                    params={{ slug: article.slug }}
                    class="text-fg hover:text-link focus-visible:text-link"
                    {...analytics_autocapture({ id: "article-link", article_slug: article.slug })}
                  >
                    {article.title}
                  </Link>
                  <ArticleTags tags={article.tags} />
                </div>
                <IndexList.Leader />
                <IndexList.Value>
                  <ArticleDate date={article.date} />
                </IndexList.Value>
              </IndexList.Row>
            )}
          </For>
        </IndexList.Root>
      </Show>
    </Page>
  );
}
