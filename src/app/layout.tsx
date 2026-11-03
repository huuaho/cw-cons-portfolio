import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.css";
import "@/styles/template.css";
import "@/styles/site.css";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { getHome, getSite } from "@/lib/content";

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    title: { default: site.seo.title, template: `%s | ${site.companyName}` },
    description: site.seo.description,
  };
}

// Before first paint: turn on scroll reveals and apply the saved or system theme.
const BOOT_SCRIPT = `(function(d){d.classList.add('kit-reveal-on');try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.setAttribute('data-bs-theme',t);}catch(e){}})(document.documentElement);`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = getSite();
  const home = getHome();

  return (
    <html lang="en" data-bs-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <link rel="preload" href="/fonts/roboto-mono/roboto-mono-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/mulish/mulish-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <a className="skip-link visually-hidden-focusable" href="#main">
          Skip to content
        </a>
        <SiteNav logoText={site.logoText} />
        <main id="main">{children}</main>
        <SiteFooter site={site} home={home} />
        <Reveal />
      </body>
    </html>
  );
}
