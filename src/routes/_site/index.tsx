import { createFileRoute } from "@tanstack/solid-router";
import { AboutPage } from "@/client/features/portfolio/about-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/")({
  head: () => {
    const metadata = seo({
      title: `${profile.name} · ${m.profile_role()}`,
      description: m.meta_about({ name: profile.name }),
      path: "/",
      image: site.socialImage,
      jsonLd: {
        name: profile.name,
        alternateName: profile.handle,
        description: m.profile_about_intro(),
        jobTitle: m.profile_role(),
        email: profile.email,
        sameAs: profile.links.map((link) => link.href),
      },
    });

    return { meta: metadata.meta, links: metadata.links, scripts: metadata.scripts };
  },
  component: AboutPage,
});
