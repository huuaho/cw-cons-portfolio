// A project's photos, facts and description in one of the template's three project layouts:
// "carousel" (portfolio-single-1), "wide" single photo (-2), "side" photo beside the details (-3).
// Shown in place on the home page (heading h2) and on the project's own page (heading h1).
import ProjectPhotos from "@/components/ProjectPhotos";
import { paragraphs } from "@/lib/format";
import type { Project } from "@/lib/content";

function Facts({ project, colClass }: { project: Project; colClass: string }) {
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Year", value: project.year ? String(project.year) : "" },
    { label: "Type", value: project.category },
    { label: "Client", value: project.client },
    { label: "Location", value: project.location },
  ];
  if (project.link) {
    facts.push({
      label: "Visit",
      value: (
        <a href={project.link} target="_blank" rel="noopener">
          {project.link.replace(/^https?:\/\//, "")}
        </a>
      ),
    });
  }
  return (
    <>
      {facts
        .filter((f) => f.value)
        .map((f) => (
          <div key={f.label} className={colClass}>
            <div className="detail-v1">
              <span className="detail-label">{f.label}</span>
              <span className="detail-val">{f.value}</span>
            </div>
          </div>
        ))}
    </>
  );
}

export default function ProjectDetails({ project, headingLevel }: { project: Project; headingLevel: "h1" | "h2" }) {
  const Heading = headingLevel;
  const photos = project.photos.length ? project.photos : [project.cover].filter(Boolean);
  const text = paragraphs(project.description);
  const title = <Heading className="heading-portfolio-single-h2 text-black">{project.title}</Heading>;

  if (project.layout === "side") {
    return (
      <>
        {title}
        <div className="row mb-5 align-items-stretch">
          <div className="col-lg-6 mb-5 mb-lg-0">
            {photos[0] && <img src={photos[0]} alt={project.title} className="img-fluid" />}
          </div>
          <div className="col-lg-6 ps-lg-5">
            <div className="row mb-3">
              <Facts project={project} colClass="col-sm-6 mb-4" />
            </div>
            {text.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {title}
      <div className="row justify-content-between mb-5">
        <div className={project.layout === "wide" ? "col-lg-12 mb-5 mb-lg-0" : "col-12 mb-4"}>
          {project.layout === "wide" ? (
            photos[0] && <img src={photos[0]} alt={project.title} className="img-fluid" />
          ) : (
            <ProjectPhotos photos={photos} title={project.title} />
          )}
        </div>
        <div className="col-12 my-5">
          <div className="row">
            <Facts project={project} colClass="col-sm-6 col-lg-3" />
          </div>
        </div>
        {text.map((p, i) => (
          <div key={i} className="col-md-6">
            <p>{p}</p>
          </div>
        ))}
      </div>
    </>
  );
}
