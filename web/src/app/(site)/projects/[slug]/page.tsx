import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectDetails from "@/components/ProjectDetails";
import { page } from "@/lib/base-path";
import { getProject, getProjects, paragraphs } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const description = paragraphs(project.description)[0];
  const url = page(`/projects/${project.slug}/`);
  return {
    title: project.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: project.title, description, url, images: project.cover ? [project.cover] : undefined },
    twitter: { card: "summary_large_image", title: project.title, description, images: project.cover ? [project.cover] : undefined },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="untree_co-section untree_co-section-4 pb-0">
      <div className="container">
        <div className="portfolio-single-wrap">
          <div className="portfolio-single-inner">
            <ProjectDetails project={project} headingLevel="h1" />

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
