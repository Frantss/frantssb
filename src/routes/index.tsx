import { createFileRoute } from "@tanstack/solid-router";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";

const metadata = seo({ title: site.name, description: site.name });

export const Route = createFileRoute("/")({
  head: () => ({ meta: metadata.meta, links: metadata.links }),
  component: Home,
});

function Home() {
  return (
    <main class="mx-auto max-w-3xl px-4 py-16">
      <h1 class="text-3xl font-semibold">{site.name}</h1>
    </main>
  );
}
