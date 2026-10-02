import { createFileRoute } from "@tanstack/solid-router";
import { WritingPage } from "@/client/features/portfolio/writing-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";

const metadata = seo({
  title: `Writing · ${profile.name}`,
  description: `Notes and essays by ${profile.name}.`,
});

export const Route = createFileRoute("/_site/writing/")({
  head: () => ({ meta: metadata.meta, links: metadata.links }),
  component: WritingPage,
});
