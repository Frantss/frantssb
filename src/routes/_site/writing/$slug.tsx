import { createFileRoute, notFound } from "@tanstack/solid-router";
import { PostPage } from "@/client/features/portfolio/post-page";
import { posts, profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";

export const Route = createFileRoute("/_site/writing/$slug")({
  loader: ({ params }) => {
    const post = posts.find((candidate) => candidate.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    const metadata = seo({
      title: `${loaderData?.title ?? "Writing"} · ${profile.name}`,
      description: loaderData?.body[0] ?? `Writing by ${profile.name}.`,
    });
    return { meta: metadata.meta, links: metadata.links };
  },
  component: PostRoute,
});

function PostRoute() {
  const post = Route.useLoaderData();
  return <PostPage post={post()} />;
}
