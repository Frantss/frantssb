import { createFileRoute } from "@tanstack/solid-router";
import { WorkPage } from "@/client/features/portfolio/work-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/work")({
  head: () => {
    const metadata = seo({
      title: `${m.page_work()} · ${profile.name}`,
      description: m.meta_work({ name: profile.name }),
      path: "/work",
      image: site.socialImage,
    });
    return { meta: metadata.meta, links: metadata.links };
  },
  component: WorkPage,
});
