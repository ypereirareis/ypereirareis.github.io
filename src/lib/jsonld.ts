import { SITE } from "../site.config";

export function personJsonLd(site: URL): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": new URL("/#person", site).href,
    name: SITE.author,
    jobTitle: SITE.jobTitle,
    url: site.href,
    image: new URL("/apple-touch-icon.png", site).href,
    sameAs: Object.values(SITE.links),
  };
}

export function breadcrumbJsonLd(
  site: URL,
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, site).href,
    })),
  };
}
