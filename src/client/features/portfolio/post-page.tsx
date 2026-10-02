import { Link } from "@tanstack/solid-router";
import { Page, PageTitle, Paragraphs } from "@/client/ui/page";
import { PostDate } from "./post-date";
import type { Post } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function PostPage(props: { post: Post }) {
  const locale = useLocale();
  return (
    <Page class="max-w-[64ch]">
      <PageTitle>{props.post.title}</PageTitle>
      <PostDate date={props.post.date} class="text-xs text-faint" />
      <Paragraphs items={props.post.body} />
      <Link to="/writing" class="text-xs">
        {m.post_all_writing({}, { locale: locale() })}
      </Link>
    </Page>
  );
}
