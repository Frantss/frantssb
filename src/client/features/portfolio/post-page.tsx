import { Link } from "@tanstack/solid-router";
import { Page, PageTitle, Paragraphs } from "@/client/ui/page";
import { PostDate } from "./post-date";
import type { Post } from "./portfolio.data";

export function PostPage(props: { post: Post }) {
  return (
    <Page class="max-w-[64ch]">
      <PageTitle>{props.post.title}</PageTitle>
      <PostDate date={props.post.date} class="text-xs text-faint" />
      <Paragraphs items={props.post.body} />
      <Link to="/writing" class="text-xs">
        ← All writing
      </Link>
    </Page>
  );
}
