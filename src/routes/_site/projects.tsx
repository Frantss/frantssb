import { createFileRoute } from "@tanstack/solid-router";
import { ProjectsPage } from "@/client/features/portfolio/projects-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";

const metadata = seo({
  title: `Projects · ${profile.name}`,
  description: `Things ${profile.name} has built.`,
});

export const Route = createFileRoute("/_site/projects")({
  head: () => ({ meta: metadata.meta, links: metadata.links }),
  component: ProjectsPage,
});
