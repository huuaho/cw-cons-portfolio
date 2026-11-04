import type { Metadata } from "next";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.css";
import "@/styles/template.css";
import "@/styles/site.css";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { getHome, getProjects, getSite } from "@/lib/content";
import { SITE_URL, structuredData } from "@/lib/seo";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function generateMetadata(): Metadata {
  const site = getSite();
  const home = getHome();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: site.seo.title, template: `%s | ${site.companyName}` },
    description: site.seo.description,
    authors: [{ name: site.companyName }],
    alternates: { canonical: "/" },
    // Social previews (the template's og: and twitter: tags).
    openGraph: {
      type: "website",
      siteName: site.companyName,
      title: site.seo.title,
      description: site.seo.description,
      url: "/",
      locale: "en_US",
      images: home.hero.image ? [{ url: home.hero.image, alt: site.companyName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.title,
      description: site.seo.description,
      images: home.hero.image ? [home.hero.image] : undefined,
    },
  };
}

// Before first paint: turn on scroll reveals and apply the saved or system theme.
const BOOT_SCRIPT = `(function(d){d.classList.add('kit-reveal-on');try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.setAttribute('data-bs-theme',t);}catch(e){}})(document.documentElement);`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = getSite();
  const home = getHome();
  const projects = getProjects().map(({ slug, title }) => ({ slug, title }));

  return (
    <html lang="en" data-bs-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <link rel="preload" href="/fonts/roboto-mono/roboto-mono-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/mulish/mulish-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        {/* Structured data (schema.org): the business, for search results and maps. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(site, home)) }} />
      </head>
      <body>
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
        {/* Google Analytics 4, only when a measurement ID is set at build time. */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
