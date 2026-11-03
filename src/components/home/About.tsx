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

            <div className="row my-5">
              {about.credentials.length > 0 && (
                <div className="col-lg-6 mb-4" data-reveal="fade-up">
                  <h3 className="text-black h5 fw-bold mb-3">Licensed and insured</h3>
                  <ul className="list-unstyled about-list">
                    {about.credentials.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {site.serviceAreas.length > 0 && (
                <div className="col-lg-6 mb-4" data-reveal="fade-up">
                  <h3 className="text-black h5 fw-bold mb-3">Areas we serve</h3>
                  <ul className="list-unstyled about-list">
                    {site.serviceAreas.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
