import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import Hero from "@/components/home/Hero";
import Portfolio from "@/components/home/Portfolio";
import Services from "@/components/home/Services";
import { getHome, getProjects, getSite } from "@/lib/content";

export default function HomePage() {
  const site = getSite();
  const home = getHome();
  const projects = getProjects();

  return (
    <>
      <Hero hero={home.hero} site={site} />
      <Services services={home.services} />
      <Portfolio portfolio={home.portfolio} projects={projects} />
      <About about={home.about} site={site} />
      <Contact contact={home.contact} site={site} />
    </>
  );
}
