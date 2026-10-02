import { createFileRoute } from "@tanstack/solid-router";
import { WorkPage } from "@/client/features/portfolio/work-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";

const metadata = seo({
  title: `Work · ${profile.name}`,
  description: `Where ${profile.name} has worked.`,
});

export const Route = createFileRoute("/_site/work")({
  head: () => ({ meta: metadata.meta, links: metadata.links }),
  component: WorkPage,
});
