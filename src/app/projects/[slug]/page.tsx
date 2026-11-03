import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectPhotos from "@/components/ProjectPhotos";
import { getProject, getProjects, paragraphs } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: paragraphs(project.description)[0] } : {};
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const photos = project.photos.length ? project.photos : [project.cover].filter(Boolean);
  const details = [
    { label: "Type", value: project.category },
    { label: "Location", value: project.location },
    { label: "Year", value: String(project.year) },
  ].filter((d) => d.value);
  const text = paragraphs(project.description);

  return (
    <div className="untree_co-section untree_co-section-4 pb-0">
      <div className="container">
        <div className="portfolio-single-wrap">
          <div className="portfolio-single-inner">
            <h1 className="heading-portfolio-single-h2 text-black">{project.title}</h1>

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
              {text.map((p, i) => (
                <div key={i} className="col-md-6">
                  <p>{p}</p>
                </div>
              ))}
            </div>

            <div className="row mt-5">
              <div className="col-12">
                <Link href="/#portfolio-section" className="btn btn-primary">
                  <span className="fa-solid fa-arrow-left me-2" aria-hidden="true" /> Back to our work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
