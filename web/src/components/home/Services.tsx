import SectionHeading from "@/components/SectionHeading";
import ServiceIcon from "@/components/ServiceIcon";
import type { HomeContent } from "@/lib/content";

export default function Services({ services }: { services: HomeContent["services"] }) {
  return (
    <div className="untree_co-section pb-0" id="services-section">
      <div className="container">
        <SectionHeading title={services.heading} intro={services.intro} />
        <div className="row">
          {services.items.map((item) => (
            <div key={item.title} className="col-6 col-lg-4 mb-4">
              <div className="service">
                <div className="mb-3" data-reveal="fade-up">
                  <ServiceIcon name={item.icon} />
                </div>
                <h3 data-reveal="fade-up">{item.title}</h3>
                <p data-reveal="fade-up">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
