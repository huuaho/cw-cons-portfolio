import { telHref, type HomeContent, type SiteSettings } from "@/lib/content";

export default function Hero({ hero, site }: { hero: HomeContent["hero"]; site: SiteSettings }) {
  const href = hero.buttonAction === "call" ? telHref(site.phone) : "#contact-section";

  return (
    <div className="untree_co-section pb-0" id="home-section">
      <div className="container">
        <h1 className="heading mb-0">
          {hero.headline}{" "}
          <strong>
            {hero.headlineEmphasis}
            <span className="text-primary">.</span>
          </strong>
        </h1>
        <p className="subheading mb-4">{hero.subheading}</p>
        <p>
          <a href={href} className="btn btn-black">
            {hero.buttonLabel}
          </a>
        </p>
        {hero.image && (
          <figure className="hero-image mt-5 mb-0" data-reveal="fade-up">
            <img src={hero.image} alt="" className="img-fluid w-100" fetchPriority="high" />
          </figure>
        )}
      </div>
    </div>
  );
}
