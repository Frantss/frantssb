import { Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { PostDate } from "./post-date";
import { portfolio_posts } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";
import { analytics_autocapture } from "@/client/analytics/analytics";

export function WritingPage() {
  const locale = useLocale();
  const posts = () => portfolio_posts(locale());
  return (
    <Page>
      <PageTitle>{m.page_writing({}, { locale: locale() })}</PageTitle>
      <Show
        when={posts().length > 0}
        fallback={<p class="m-0 text-muted">{m.writing_empty({}, { locale: locale() })}</p>}
      >
        <IndexList.Root>
          <For each={posts()}>
            {(post) => (
              <IndexList.Row>
                <Link
                  to="/writing/$slug"
                  params={{ slug: post.slug }}
                  class="text-fg"
                  {...analytics_autocapture({ id: "post-link", post_slug: post.slug })}
                >
                  {post.title}
                </Link>
                <IndexList.Leader />
                <IndexList.Value>
                  <PostDate date={post.date} />
                </IndexList.Value>
              </IndexList.Row>
            )}
          </For>
        </IndexList.Root>
      </Show>
    </Page>
  );
}
