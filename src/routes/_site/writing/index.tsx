import { createFileRoute } from "@tanstack/solid-router";
import { WritingPage } from "@/client/features/portfolio/writing-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/writing/")({
  head: () => {
    const metadata = seo({
      title: `${m.page_writing()} · ${profile.name}`,
      description: m.meta_writing({ name: profile.name }),
      path: "/writing",
      image: site.socialImage,
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: WritingPage,
});
