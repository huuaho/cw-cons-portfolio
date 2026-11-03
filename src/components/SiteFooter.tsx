import Link from "next/link";
import { telHref, type HomeContent, type SiteSettings } from "@/lib/content";

const SOCIAL = [
  { key: "facebook", label: "Facebook", icon: "fa-facebook" },
  { key: "instagram", label: "Instagram", icon: "fa-instagram" },
  { key: "google", label: "Google", icon: "fa-google" },
] as const;

export default function SiteFooter({ site, home }: { site: SiteSettings; home: HomeContent }) {
  const social = SOCIAL.filter((s) => site.social[s.key]);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-3">
            <div className="widget">
              <h2>{site.companyName}</h2>
              <ul className="list-unstyled float-start links">
                <li><Link href="/#home-section">Home</Link></li>
                <li><Link href="/#portfolio-section">{home.portfolio.heading}</Link></li>
                <li><Link href="/#about-section">{home.about.heading}</Link></li>
                <li><Link href="/#contact-section">{home.contact.heading}</Link></li>
              </ul>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="widget">
              <h2>{home.services.heading}</h2>
              <ul className="list-unstyled float-start links">
                {home.services.items.map((s) => (
                  <li key={s.title}>
                    <Link href="/#services-section">{s.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="widget">
              <h2>Areas we serve</h2>
              <ul className="list-unstyled float-start links">
                {site.serviceAreas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="widget">
              <h2>Contact</h2>
              {site.address && <address>{site.address}</address>}
              <ul className="list-unstyled links mb-4">
                <li><a href={telHref(site.phone)}>{site.phone}</a></li>
                <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                {site.hours && <li>{site.hours}</li>}
              </ul>
              {social.length > 0 && (
                <>
                  <h3>Connect</h3>
                  <ul className="list-unstyled social">
                    {social.map((s) => (
                      <li key={s.key}>
                        <a href={site.social[s.key]} aria-label={s.label} target="_blank" rel="noopener">
                          <span className={`fa-brands ${s.icon}`} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12 text-center">
            <p>
              Copyright &copy;{new Date().getFullYear()} {site.companyName}. All rights reserved | Design based on a
              template by{" "}
              <a href="https://colorlib.com" target="_blank" rel="noopener">
                Colorlib
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
