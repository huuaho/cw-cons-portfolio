import Script from "next/script";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { getHome, getProjects, getSite } from "@/lib/content";
import { structuredData } from "@/lib/seo";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// The public site's chrome: nav, footer, scroll reveals, structured data and optional analytics.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = getSite();
  const home = getHome();
  const projects = getProjects().map(({ slug, title }) => ({ slug, title }));

  return (
    <>
      {/* Structured data (schema.org): the business, for search results and maps. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(site, home)) }} />
      <a className="skip-link visually-hidden-focusable" href="#main">
        Skip to content
      </a>
      <SiteNav
        logoText={site.logoText}
        projects={projects}
        labels={{
          portfolio: home.portfolio.heading,
          services: home.services.heading,
          about: home.about.heading,
          contact: home.contact.heading,
        }}
      />
      <main id="main">{children}</main>
      <SiteFooter site={site} home={home} />
      <Reveal />
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
