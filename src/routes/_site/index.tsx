import { createFileRoute } from "@tanstack/solid-router";
import { AboutPage } from "@/client/features/portfolio/about-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/")({
  head: () => {
    const metadata = seo({
      title: profile.name,
      description: m.profile_tagline(),
      path: "/",
      image: site.socialImage,
    });
    return { meta: metadata.meta, links: metadata.links };
  },
  component: AboutPage,
});
