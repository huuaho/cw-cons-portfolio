import type { Metadata } from "next";
import Carousel from "@/components/Carousel";
import Accordion from "@/components/elements/Accordion";
import Gallery from "@/components/elements/Gallery";
import SampleForm from "@/components/elements/SampleForm";
import VideoLink from "@/components/elements/VideoLink";

// The template's elements.html: a showcase of the interface pieces the theme supports. Kept as a
// reference for building new sections; not in the menu and hidden from search engines.
export const metadata: Metadata = {
  title: "Elements",
  description: "Interface elements: accordion, photo gallery, video, lists, form, social icons and slider.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/elements/" },
  openGraph: { url: "/elements/" },
};

const P = "/uploads/placeholders/photos/";
const PHOTOS = [
  { src: P + "kitchen-1.jpg", width: 1600, height: 1063, alt: "Kitchen remodel" },
  { src: P + "addition-2.jpg", width: 1600, height: 953, alt: "Framing for an addition" },
  { src: P + "bathroom-1.jpg", width: 1600, height: 1066, alt: "Bathroom renovation" },
  { src: P + "roof-1.jpg", width: 1600, height: 1062, alt: "Roof replacement" },
  { src: P + "driveway-1.jpg", width: 1600, height: 1200, alt: "New driveway" },
  { src: P + "office-1.jpg", width: 1600, height: 1068, alt: "Office fit-out" },
];

const FAQ = [
  { title: "How long does a typical renovation take?", body: "Placeholder answer. Explain typical timelines and what affects them." },
  { title: "Do you handle permits?", body: "Placeholder answer. Explain who applies for permits and inspections." },
  { title: "How do quotes work?", body: "Placeholder answer. Explain the site visit, the written quote and payment stages." },
];

const QUOTES = [
  { name: "Adam Aderson", photo: "/uploads/placeholders/people/person-2.svg" },
  { name: "Lukas Devlin", photo: "/uploads/placeholders/people/person-3.svg" },
  { name: "Kayla Bryant", photo: "/uploads/placeholders/people/person-4.svg" },
];

export default function ElementsPage() {
  return (
    <>
      <div className="untree_co-section pb-0">
        <div className="container">
          <h1 className="heading mb-0">Elements</h1>
          <p className="subheading mb-4">The building blocks available for this site&apos;s sections.</p>
        </div>
      </div>

      <div className="untree_co-section untree_co-section-4 padding-md">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mx-auto contents">
              <div className="row">
                <div className="col-lg-6">
                  <div className="custom-block">
                    <h2 className="section-title text-black">Accordion</h2>
                    <Accordion items={FAQ} />
                  </div>
                  <div className="custom-block" data-reveal="fade-up">
                    <h2 className="section-title text-black">Gallery</h2>
                    <Gallery photos={PHOTOS} />
                  </div>
                  <div className="custom-block" data-reveal="fade-up">
                    <h2 className="section-title text-black">Video</h2>
                    <VideoLink url="https://vimeo.com/342333493" thumbnail={P + "hero.jpg"} title="Sample video" />
                  </div>
                  <div className="custom-block" data-reveal="fade-up">
                    <h2 className="section-title text-black mb-3">Check Unordered List</h2>
                    <ul className="list-unstyled ul-check primary">
                      <li>Licensed and insured</li>
                      <li>Written quotes, no surprises</li>
                      <li>Clean, safe job sites</li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="custom-block">
                    <h2 className="section-title text-black">Form</h2>
                    <SampleForm />
                  </div>
                  <div className="custom-block" data-reveal="fade-up">
                    <h2 className="section-title text-black">Social Icons</h2>
                    <ul className="list-unstyled social-icons light">
                      <li><a href="#" aria-label="Facebook"><span className="fa-brands fa-facebook" aria-hidden="true" /></a></li>
                      <li><a href="#" aria-label="Twitter"><span className="fa-brands fa-twitter" aria-hidden="true" /></a></li>
                      <li><a href="#" aria-label="LinkedIn"><span className="fa-brands fa-linkedin" aria-hidden="true" /></a></li>
                      <li><a href="#" aria-label="Google"><span className="fa-brands fa-google" aria-hidden="true" /></a></li>
                      <li><a href="#" aria-label="YouTube"><span className="fa-brands fa-youtube" aria-hidden="true" /></a></li>
                    </ul>
                  </div>
                  <div className="custom-block" data-reveal="fade-up">
                    <h2 className="section-title text-black text-center">Slider</h2>
                    <Carousel label="Client quotes">
                      {QUOTES.map((q) => (
                        <div key={q.name} className="testimonial mx-auto text-center">
                          <figure className="img-wrap mb-3">
                            <img loading="lazy" src={q.photo} alt={q.name} className="img-fluid rounded-circle" style={{ width: 80 }} />
                          </figure>
                          <h3 className="name">{q.name}</h3>
                          <blockquote>
                            <p>&ldquo;Placeholder quote. Replace with a short, real comment from a client.&rdquo;</p>
                          </blockquote>
                        </div>
                      ))}
                    </Carousel>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
