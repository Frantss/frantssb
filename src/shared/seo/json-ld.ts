import { getLocale } from "@/paraglide/runtime";
import { site } from "@/shared/seo/site";

export interface JsonLdOptions {
  name: string;
  alternateName: string;
  description: string;
  jobTitle: string;
  email: string;
  sameAs: string[];
}

export function createJsonLd(person: JsonLdOptions) {
  const url = `${site.origin}/`;
  const personId = `${url}#person`;
  const websiteId = `${url}#website`;
  const language = getLocale();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        url,
        ...person,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url,
        name: site.name,
        alternateName: person.name,
        inLanguage: language,
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: person.name,
        inLanguage: language,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
      },
    ],
  } as const;
}
