"use client";

// The template's testimonials slider (main.js initTestimonialsSlider): 3 / 2 / 1 cards by width,
// arrows, swipe, 5 s autoplay paused on hover, focus, hidden tab and reduced motion.
import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { swipeHandlers, useAutoplay } from "@/components/useAutoplay";
import type { HomeContent } from "@/lib/content";

function perViewFor(width: number) {
  if (width < 600) return 1;
  if (width < 900) return 2;
  return 3;
}

export default function Testimonials({ testimonials }: { testimonials: HomeContent["testimonials"] }) {
  const items = testimonials.items;
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const sync = () => {
      const n = perViewFor(window.innerWidth);
      setPerView((prev) => {
        if (prev !== n) setIndex(0);
        return n;
      });
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const max = Math.max(0, items.length - perView);
  const go = (step: number) => setIndex((i) => (i + step > max ? 0 : i + step < 0 ? max : i + step));
  const { restart, handlers, reduce } = useAutoplay(() => go(1), 5000, max > 0);
  const move = (step: 1 | -1) => {
    go(step);
    restart();
  };
  const width = 100 / perView;

  return (
    <div className="untree_co-section">
      <div className="container">
        <SectionHeading title={testimonials.heading} intro={testimonials.intro} />
        <div data-reveal="fade-up">
          <div
            className="testimonials-slider"
            role="region"
            aria-roledescription="carousel"
            aria-label={testimonials.heading}
            {...handlers}
          >
            <div
              className="testimonials-track"
              style={{
                display: "flex",
                transform: `translateX(${-index * width}%)`,
                transition: reduce ? "none" : "transform 0.5s ease",
              }}
              {...swipeHandlers(move)}
            >
              {items.map((t, i) => {
                const shown = i >= index && i < index + perView;
                return (
                  <div
                    key={t.name + i}
                    className="item"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${items.length}`}
                    aria-hidden={!shown}
                    inert={!shown}
                    style={{ flex: `0 0 ${width}%`, maxWidth: `${width}%` }}
                  >
                    <div className="testimonial-v1">
                      {t.photo && <img loading="lazy" src={t.photo} alt={t.name} className="img-fluid" width={450} height={450} />}
                      <div className="mb-4">
                        <h3>{t.name}</h3>
                        <span className="caption">{t.role}</span>
                      </div>
                      <blockquote>
                        <p>{t.quote}</p>
                      </blockquote>
                    </div>
                  </div>
                );
              })}
            </div>
            {max > 0 && (
              <div className="slider-nav">
                <button type="button" className="slider-prev" aria-label="Previous testimonials" onClick={() => move(-1)}>
                  <span className="fa-solid fa-arrow-left" aria-hidden="true" />
                </button>
                <button type="button" className="slider-next" aria-label="Next testimonials" onClick={() => move(1)}>
                  <span className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
