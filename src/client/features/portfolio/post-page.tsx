import { Link } from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Page, PageTitle } from "@/client/ui/page";
import { post_content } from "@/content/posts";
import { PostDate } from "./post-date";
import { PostTags } from "./post-tags";
import type { Post } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function PostPage(props: { post: Post }) {
  const locale = useLocale();
  return (
    <Page class="min-w-0 max-w-[64ch]">
      <PageTitle>{props.post.title}</PageTitle>
      <div class="grid gap-2">
        <PostDate date={props.post.date} class="text-xs text-faint" />
        <PostTags tags={props.post.tags} />
      </div>
      <article class="post-body min-w-0">
        <Suspense fallback={<p role="status">Loading article…</p>}>
          <Dynamic component={post_content(props.post.slug)} />
        </Suspense>
      </article>
      <Link to="/writing" class="text-xs">
        {m.post_all_writing({}, { locale: locale() })}
      </Link>
    </Page>
  );
}
