import { describe, expect, it } from "vite-plus/test";
import { createSitemap } from "../sitemap";

describe("sitemap", () => {
  it("includes public pages and each supplied post at their canonical URLs", () => {
    const xml = createSitemap([{ slug: "hello-world" }, { slug: "another-post" }]);
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

    expect(urls).toEqual([
      "https://frantss.uy/",
      "https://frantss.uy/work",
      "https://frantss.uy/projects",
      "https://frantss.uy/writing",
      "https://frantss.uy/writing/hello-world",
      "https://frantss.uy/writing/another-post",
    ]);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).not.toContain("<lastmod>");
  });

  it("serves the public pages when there are no posts", () => {
    expect(createSitemap([]).match(/<url>/g)).toHaveLength(4);
  });

  it("keeps reserved characters inside the post slug and escapes XML text", () => {
    const xml = createSitemap([{ slug: "solid & mdx/<tips>?\"'" }]);

    expect(xml).toContain(
      "<loc>https://frantss.uy/writing/solid%20%26%20mdx%2F%3Ctips%3E%3F%22&apos;</loc>",
    );
  });
});
