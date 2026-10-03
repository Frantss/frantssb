import { createFileRoute } from "@tanstack/solid-router";
import { ProjectsPage } from "@/client/features/portfolio/projects-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/projects")({
  head: () => {
    const metadata = seo({
      title: `${m.page_projects()} · ${profile.name}`,
      description: m.meta_projects({ name: profile.name }),
      path: "/projects",
      image: site.socialImage,
    });
    return { meta: metadata.meta, links: metadata.links };
  },
  component: ProjectsPage,
});
