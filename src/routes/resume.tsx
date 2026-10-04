import { createFileRoute } from "@tanstack/solid-router";
import { ResumePage } from "@/client/features/portfolio/resume-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/resume")({
  head: () => {
    const metadata = seo({
      title: profile.name,
      description: m.meta_resume({ name: profile.name }),
      robots: "noindex",
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: ResumePage,
});
