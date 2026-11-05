import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import Hero from "@/components/home/Hero";
import News from "@/components/home/News";
import Portfolio from "@/components/home/Portfolio";
import Services from "@/components/home/Services";
import Stats from "@/components/home/Stats";
import Testimonials from "@/components/home/Testimonials";
import { getHome, getProjects, getSite } from "@/lib/content";

// Section order follows the template: hero, portfolio, services, about, skills, testimonials,
// blog, contact. The last three can be switched off in Pages CMS.
export default function HomePage() {
  const site = getSite();
  const home = getHome();
  const projects = getProjects();

  return (
    <>
      <Hero hero={home.hero} site={site} />
      <Portfolio portfolio={home.portfolio} projects={projects} />
      <Services services={home.services} />
      <About about={home.about} site={site} />
      {home.stats.show && home.stats.items.length > 0 && <Stats stats={home.stats} />}
      {home.testimonials.show && home.testimonials.items.length > 0 && <Testimonials testimonials={home.testimonials} />}
      {home.news.show && home.news.items.length > 0 && <News news={home.news} />}
      <Contact contact={home.contact} site={site} />
    </>
  );
}
