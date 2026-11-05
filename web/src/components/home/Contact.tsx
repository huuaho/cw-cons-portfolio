import SectionHeading from "@/components/SectionHeading";
import { telHref, type HomeContent, type SiteSettings } from "@/lib/content";
import ContactForm from "./ContactForm";
import MapEmbed from "./MapEmbed";

export default function Contact({ contact, site }: { contact: HomeContent["contact"]; site: SiteSettings }) {
  return (
    <div className="untree_co-section" id="contact-section">
      <div className="container">
        <SectionHeading title={contact.heading} intro={contact.intro} />
        <div className="row">
          <div className="col-lg-6 mb-5 mb-lg-0">
            <ContactForm phone={site.phone} email={site.email} />
          </div>
          <div className="col-lg-6">
            <ul className="list-unstyled contact-details mb-4">
              <li>
                <span className="detail-label">Phone</span> <a href={telHref(site.phone)}>{site.phone}</a>
              </li>
              <li>
                <span className="detail-label">Email</span> <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              {site.hours && (
                <li>
                  <span className="detail-label">Hours</span> {site.hours}
                </li>
              )}
            </ul>
            {site.showAddressOnMap && site.address && <MapEmbed address={site.address} />}
          </div>
        </div>
      </div>
    </div>
  );
}
