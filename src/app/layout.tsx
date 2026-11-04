import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.css";
import "@/styles/template.css";
import "@/styles/site.css";
import { getHome, getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

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
  return (
    <html lang="en" data-bs-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <link rel="preload" href="/fonts/roboto-mono/roboto-mono-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/mulish/mulish-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
