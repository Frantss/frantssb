import { createFileRoute } from "@tanstack/solid-router";
import { EducationPage } from "@/client/features/portfolio/education-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/education")({
  head: () => {
    const metadata = seo({
      title: `${m.page_education()} · ${profile.name}`,
      description: m.meta_education({ name: profile.name }),
      path: "/education",
      image: site.socialImage,
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: EducationPage,
});
