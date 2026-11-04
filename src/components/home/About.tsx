import SectionHeading from "@/components/SectionHeading";
import { paragraphs, type HomeContent, type SiteSettings } from "@/lib/content";

export default function About({ about, site }: { about: HomeContent["about"]; site: SiteSettings }) {
  return (
    <div className="untree_co-section pb-0" id="about-section">
      <div className="container">
        <SectionHeading title={about.heading} intro={about.intro} align="start" />
        <div className="row">
          <div className="col-lg-6 position-relative">
            {about.yearsInBusiness > 0 && (
              <div className="experience-wrap" data-reveal="fade-up">
                <div className="experience">
                  <span className="d-block">{about.yearsInBusiness}+ years in business</span>
                  <a href="#portfolio-section">
                    <span className="fa-solid fa-arrow-right" aria-hidden="true" /> See our work
                  </a>
                  <a href="#contact-section">
                    <span className="fa-solid fa-arrow-right" aria-hidden="true" /> Request a quote
                  </a>
                </div>
              </div>
            )}
            {about.image && (
              <figure className="dotted-bg" data-reveal="fade-up">
                <img src={about.image} alt="" className="img-fluid" loading="lazy" />
              </figure>
            )}
          </div>
          <div className="col-lg-6 ps-md-5">
            <h3 className="text-black h5 fw-bold mb-3" data-reveal="fade-up">
              Our story
            </h3>
            {paragraphs(about.story).map((p, i) => (
              <p key={i} data-reveal="fade-up">
                {p}
              </p>
            ))}

            {site.serviceAreas.length > 0 && (
              <p data-reveal="fade-up">
                <strong>Areas we serve:</strong> {site.serviceAreas.join(", ")}
              </p>
            )}

            {about.credentials.length > 0 && (
              <div className="row my-5">
                <div className="col-12">
                  <h3 className="text-black h5 fw-bold mb-3" data-reveal="fade-up">
                    Licences and memberships
                  </h3>
                </div>
                {about.credentials.map((c) => (
                  <div key={c.title} className="col-lg-6">
                    <div className="work-experience" data-reveal="fade-up">
                      <h3 className="position">{c.title}</h3>
                      <span className="company">{c.detail}</span>
                      <span className="year">{c.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
