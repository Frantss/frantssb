// @vitest-environment node
import { describe, expect, it } from "vite-plus/test";
import { seo } from "@/shared/seo/seo";

const image = {
  path: "/media/social/page.png?v=abc123",
  width: 1200,
  height: 630,
  alt: "Page image",
};

describe("SEO metadata", () => {
  it("builds canonical, Open Graph, and Twitter metadata for a public route", () => {
    const metadata = seo({
      title: "Page title",
      description: "Page description",
      path: "/page",
      image,
    });

    expect(metadata.links).toEqual([
      {
        rel: "canonical",
        href: "https://frantss.uy/page",
      },
    ]);
    expect(metadata.meta).toContainEqual({ title: "Page title" });
    expect(metadata.meta).toContainEqual({
      name: "description",
      content: "Page description",
    });
    expect(metadata.meta).toContainEqual({
      property: "og:url",
      content: "https://frantss.uy/page",
    });
    expect(metadata.meta).toContainEqual({
      property: "og:image",
      content: "https://frantss.uy/media/social/page.png?v=abc123",
    });
    expect(metadata.meta).toContainEqual({ property: "og:image:width", content: "1200" });
    expect(metadata.meta).toContainEqual({ property: "og:image:height", content: "630" });
    expect(metadata.meta).toContainEqual({ property: "og:image:alt", content: "Page image" });
    expect(metadata.meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });
  });

  it("keeps the homepage canonical URL at the origin root", () => {
    const metadata = seo({ title: "Home", description: "Home", path: "/", image });

    expect(metadata.links).toEqual([{ rel: "canonical", href: "https://frantss.uy/" }]);
  });

  it("supports noindex pages without publishing a canonical URL", () => {
    const metadata = seo({
      title: "Private page",
      description: "Private page",
      robots: "noindex, nofollow",
    });

    expect(metadata.links).toEqual([]);
    expect(metadata.meta).toContainEqual({ name: "robots", content: "noindex, nofollow" });
    expect(metadata.meta.some((entry) => "property" in entry && entry.property === "og:url")).toBe(
      false,
    );
  });
});
