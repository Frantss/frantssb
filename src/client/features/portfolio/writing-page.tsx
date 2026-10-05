import { Link, useNavigate, useRouterState, useSearch } from "@tanstack/solid-router";
import { useQuery } from "@tanstack/solid-query";
import { createEffect, For, Show, Suspense } from "solid-js";
import { createRateLimitCooldown } from "@/client/orpc/orpc.ratelimit";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { ToastProvider } from "@/client/ui/toast";
import { ArticleDate } from "@/client/features/portfolio/article-date";
import { ArticleTags } from "@/client/features/portfolio/article-tags";
import { ArticleLikeButton } from "@/client/features/portfolio/article-like-button";
import { ArticleSearchFilter } from "@/client/features/portfolio/article-search-filter";
import {
  article_searchQueryOptions,
  type ArticleSearch,
} from "@/client/features/portfolio/articles.query";
import { article_list } from "@/lib/articles/article-metadata";
import { m } from "@/paraglide/messages";
import { analytics_autocapture } from "@/client/analytics/analytics";

export function WritingPage() {
  return (
    <ToastProvider>
      <Page>
        <PageTitle>{m.page_writing()}</PageTitle>
        <Show
          when={article_list().length > 0}
          fallback={<p class="m-0 text-muted">{m.writing_empty()}</p>}
        >
          <WritingArticles />
        </Show>
      </Page>
    </ToastProvider>
  );
}

function WritingArticles() {
  const search = useSearch({ from: "/_site/writing/" });
  const navigate = useNavigate();
  const isNavigating = useRouterState({ select: (state) => state.isLoading });
  const query = useQuery(() => article_searchQueryOptions(search()));
  const cooldown = createRateLimitCooldown();
  const tags = [...new Set(article_list().flatMap((article) => article.tags))].sort();
  const offset = () => search().offset ?? 0;
  const pending = () => isNavigating() || query.isFetching;

  createEffect(() => cooldown.handle(query.error));

  function change(next: ArticleSearch, replace = false) {
    void navigate({
      to: "/writing",
      search: next,
      replace,
      resetScroll: false,
      viewTransition: false,
    });
  }

  return (
    <>
      <ArticleSearchFilter search={search()} tags={tags} onChange={change} />
      <Suspense
        fallback={
          <p class="m-0 text-xs text-muted" role="status">
            {m.writing_loading()}
          </p>
        }
      >
        <div class="grid gap-4" aria-busy={pending()}>
          <Show when={query.isError}>
            <div class="flex flex-wrap items-center gap-2">
              <Show when={!cooldown.limited()}>
                <p role="alert" class="m-0 text-sm text-muted">
                  {m.writing_search_error()}
                </p>
              </Show>
              <button
                type="button"
                disabled={cooldown.remaining() > 0}
                class="cursor-pointer border border-line-strong bg-transparent px-2 py-1 font-[inherit] text-xs text-muted hover:text-fg disabled:cursor-wait"
                onClick={() => void query.refetch()}
              >
                {m.writing_retry()}
              </button>
            </div>
          </Show>
          <Show when={!query.isError}>
            <p class="m-0 text-xs text-faint" role="status">
              {pending()
                ? m.writing_updating()
                : query.data?.total === 1
                  ? m.writing_one_article()
                  : m.writing_articles_count({ count: query.data?.total ?? 0 })}
            </p>
            <Show
              when={query.data?.items.length}
              fallback={<p class="m-0 text-muted">{m.writing_no_results()}</p>}
            >
              <IndexList.Root>
                <For each={query.data?.items ?? []}>
                  {(article) => (
                    <IndexList.Row>
                      <div class="grid min-w-0 gap-1.5">
                        <Link
                          to="/writing/$slug"
                          params={{ slug: article.slug }}
                          class="text-fg hover:text-link focus-visible:text-link"
                          {...analytics_autocapture({
                            id: "article-link",
                            article_slug: article.slug,
                          })}
                        >
                          {article.title}
                        </Link>
                        <div class="flex flex-wrap items-center gap-1.5">
                          <ArticleTags tags={article.tags} />
                          <ArticleLikeButton slug={article.slug} size="sm" />
                        </div>
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
            <Show when={(query.data?.total ?? 0) > 20 || offset() > 0}>
              <nav aria-label={m.writing_pagination()} class="flex justify-between gap-2">
                <button
                  type="button"
                  disabled={offset() === 0 || pending() || query.isPlaceholderData}
                  class="cursor-pointer border border-line-strong bg-transparent px-2 py-1 font-[inherit] text-xs text-muted hover:text-fg disabled:cursor-default disabled:opacity-50"
                  onClick={() =>
                    change({ ...search(), offset: Math.max(0, offset() - 20) || undefined })
                  }
                >
                  {m.writing_previous()}
                </button>
                <button
                  type="button"
                  disabled={
                    offset() + 20 >= (query.data?.total ?? 0) ||
                    pending() ||
                    query.isPlaceholderData
                  }
                  class="cursor-pointer border border-line-strong bg-transparent px-2 py-1 font-[inherit] text-xs text-muted hover:text-fg disabled:cursor-default disabled:opacity-50"
                  onClick={() => change({ ...search(), offset: offset() + 20 })}
                >
                  {m.writing_next()}
                </button>
              </nav>
            </Show>
          </Show>
        </div>
      </Suspense>
    </>
  );
}
