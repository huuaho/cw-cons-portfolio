import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import type { HomeContent, Project } from "@/lib/content";

export default function Portfolio({
  portfolio,
  projects,
}: {
  portfolio: HomeContent["portfolio"];
  projects: Project[];
}) {
  return (
    <div className="untree_co-section untree_co-section-4 pb-0" id="portfolio-section">
      <div className="container">
        <SectionHeading title={portfolio.heading} intro={portfolio.intro} />
        <div className="portfolio-wrapper">
          <div id="posts" className="row">
            {projects.map((project, i) => (
              <div key={project.slug} className="item col-sm-6 col-lg-4 isotope-mb-2">
                <Link
                  href={`/projects/${project.slug}/`}
                  className="portfolio-item isotope-item"
                  data-reveal={i < 3 ? undefined : "fade-up"}
                >
                  <div className="overlay">
                    <span className="wrap-icon fa-solid fa-link" aria-hidden="true" />
                    <div className="portfolio-item-content">
                      <h3>{project.title}</h3>
                      <p>{[project.category, project.location].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                  <img
                    src={project.cover}
                    className="img-fluid"
                    alt={project.title}
                    loading={i < 3 ? "eager" : "lazy"}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
