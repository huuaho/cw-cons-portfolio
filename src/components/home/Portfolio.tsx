import SectionHeading from "@/components/SectionHeading";
import type { HomeContent, Project } from "@/lib/content";
import PortfolioGrid from "./PortfolioGrid";

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
        <PortfolioGrid projects={projects} />
      </div>
    </div>
  );
}
