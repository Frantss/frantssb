import { createFileRoute } from "@tanstack/solid-router";
import { AboutPage } from "@/client/features/portfolio/about-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";

const metadata = seo({
  title: profile.name,
  description: profile.tagline,
});

export const Route = createFileRoute("/_site/")({
  head: () => ({ meta: metadata.meta, links: metadata.links }),
  component: AboutPage,
});
