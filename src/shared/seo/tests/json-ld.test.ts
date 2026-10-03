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
});
