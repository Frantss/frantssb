import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { PostDate } from "./post-date";
import { posts } from "./portfolio.data";

export function WritingPage() {
  return (
    <Page>
      <PageTitle>Writing</PageTitle>
      <IndexList.Root>
        <For each={posts}>
          {(post) => (
            <IndexList.Row>
              <Link to="/writing/$slug" params={{ slug: post.slug }} class="text-fg">
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
    </Page>
  );
}
