// A project's photos, facts and description. Shown in place on the home page (heading h2)
// and on the project's own page (heading h1).
import ProjectPhotos from "@/components/ProjectPhotos";
import { paragraphs } from "@/lib/format";
import type { Project } from "@/lib/content";

export default function ProjectDetails({ project, headingLevel }: { project: Project; headingLevel: "h1" | "h2" }) {
  const Heading = headingLevel;
  const photos = project.photos.length ? project.photos : [project.cover].filter(Boolean);
  const details = [
    { label: "Type", value: project.category },
    { label: "Location", value: project.location },
    { label: "Year", value: String(project.year) },
  ].filter((d) => d.value);

  return (
    <>
      <Heading className="heading-portfolio-single-h2 text-black">{project.title}</Heading>
      <div className="row justify-content-between mb-5">
        <div className="col-12 mb-4">
          <ProjectPhotos photos={photos} title={project.title} />
        </div>
        <div className="col-12 my-5">
          <div className="row">
            {details.map((d) => (
              <div key={d.label} className="col-sm-6 col-lg-3">
                <div className="detail-v1">
                  <span className="detail-label">{d.label}</span>
                  <span className="detail-val">{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {paragraphs(project.description).map((p, i) => (
          <div key={i} className="col-md-6">
            <p>{p}</p>
          </div>
        ))}
      </div>
    </>
  );
}
