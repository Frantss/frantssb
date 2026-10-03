import { describe, expect, it } from "vite-plus/test";
import { seo } from "@/shared/seo/seo";

const person = {
  name: "Francisco Bongiovanni",
  alternateName: "frantssb",
  description: "Fullstack developer in Uruguay.",
  jobTitle: "Product Engineer",
  email: "frantss.bongiovanni@gmail.com",
  sameAs: ["https://github.com/Frantss/"],
};

describe("JSON-LD metadata", () => {
  it("links the website and profile page to the same person at the canonical origin", () => {
    const metadata = seo({ title: person.name, description: person.description, jsonLd: person });
    const [script] = metadata.scripts;

    expect(script?.type).toBe("application/ld+json");
    expect(JSON.parse(script?.children ?? "")).toEqual({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": "https://frantss.uy/#person",
          url: "https://frantss.uy/",
          ...person,
        },
        {
          "@type": "WebSite",
          "@id": "https://frantss.uy/#website",
          url: "https://frantss.uy/",
          name: "frantssb",
          alternateName: person.name,
          inLanguage: "en",
          publisher: { "@id": "https://frantss.uy/#person" },
        },
        {
          "@type": "ProfilePage",
          "@id": "https://frantss.uy/#profile",
          url: "https://frantss.uy/",
          name: person.name,
          inLanguage: "en",
          isPartOf: { "@id": "https://frantss.uy/#website" },
          mainEntity: { "@id": "https://frantss.uy/#person" },
        },
      ],
    });
  });

  it("escapes HTML script terminators without changing the JSON data", () => {
    const name = '</script><script>alert("test")</script>';
    const metadata = seo({
      title: name,
      description: person.description,
      jsonLd: { ...person, name },
    });
    const contents = metadata.scripts[0]?.children ?? "";

    expect(contents).not.toContain("<");
    expect(JSON.parse(contents)["@graph"][0].name).toBe(name);
  });

  it("omits structured data when a route does not request it", () => {
    expect(seo({ title: "Resume", description: "Resume", robots: "noindex" }).scripts).toEqual([]);
  });

  it("describes a blog post using its content, author, publication date, and keywords", () => {
    const metadata = seo({
      title: "Article title · Francisco Bongiovanni",
      description: "An article about MDX.",
      path: "/writing/article-title",
      image: siteImage,
      article: {
        headline: "Article title",
        datePublished: "2026-10-03",
        author: { name: person.name, url: "https://frantss.uy/" },
        keywords: ["solid", "mdx"],
      },
    });
    const article = JSON.parse(metadata.scripts[0]?.children ?? "");

    expect(article).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": "https://frantss.uy/writing/article-title#article",
      url: "https://frantss.uy/writing/article-title",
      mainEntityOfPage: { "@type": "WebPage", "@id": "https://frantss.uy/writing/article-title" },
      headline: "Article title",
      description: "An article about MDX.",
      image: ["https://frantss.uy/social.png"],
      datePublished: "2026-10-03",
      author: {
        "@type": "Person",
        "@id": "https://frantss.uy/#person",
        name: person.name,
        url: "https://frantss.uy/",
      },
      keywords: ["solid", "mdx"],
    });
    expect(metadata.meta).toContainEqual({ name: "keywords", content: "solid, mdx" });
    expect(metadata.meta).toContainEqual({ name: "author", content: person.name });
    expect(metadata.meta).toContainEqual({ property: "og:type", content: "article" });
    expect(metadata.meta).toContainEqual({
      property: "article:published_time",
      content: "2026-10-03",
    });
    expect(metadata.meta).toContainEqual({
      property: "article:author",
      content: "https://frantss.uy/",
    });
  });

  it("escapes article fields in JSON-LD without adding unavailable dates or empty keywords", () => {
    const headline = "</script><script>alert('test')</script>";
    const metadata = seo({
      title: headline,
      description: "Test article.",
      path: "/writing/test",
      image: siteImage,
      article: {
        headline,
        datePublished: "2026-10-03",
        author: { name: person.name, url: "https://frantss.uy/" },
        keywords: [],
      },
    });
    const contents = metadata.scripts[0]?.children ?? "";
    const article = JSON.parse(contents);

    expect(contents).not.toContain("<");
    expect(article.headline).toBe(headline);
    expect(article).not.toHaveProperty("dateModified");
    expect(article).not.toHaveProperty("keywords");
    expect(metadata.meta.some((entry) => "name" in entry && entry.name === "keywords")).toBe(false);
  });
});

const siteImage = { path: "/social.png", width: 1200, height: 630, alt: "Site image" };
