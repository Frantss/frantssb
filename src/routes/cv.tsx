import { createFileRoute } from "@tanstack/solid-router";
import { CvPage } from "@/client/features/portfolio/cv-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/cv")({
  head: () => {
    const metadata = seo({
      title: profile.name,
      description: m.meta_cv({ name: profile.name }),
      robots: "noindex",
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: CvPage,
});
