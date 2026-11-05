// Site address and schema.org data for search engines (the template's JSON-LD block).
import { page } from "@/lib/base-path";
import type { HomeContent, SiteSettings } from "@/lib/content";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://douglasconstructionsolutions.com";

export function structuredData(site: SiteSettings, home: HomeContent) {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: site.companyName,
    url: SITE_URL + page("/"),
    description: site.seo.description,
    telephone: site.phone,
    email: site.email,
    image: home.hero.image ? new URL(home.hero.image, SITE_URL).href : undefined,
    address: site.address ? { "@type": "PostalAddress", streetAddress: site.address } : undefined,
    areaServed: site.serviceAreas.map((name) => ({ "@type": "City", name })),
    knowsAbout: home.services.items.map((s) => s.title),
    sameAs: sameAs.length ? sameAs : undefined,
  };
}
