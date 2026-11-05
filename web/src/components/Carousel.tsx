"use client";

// Sliding carousel with the behaviour of the template's Bootstrap carousels: slides, autoplays
// every 5 s, pauses on hover/focus, wraps, arrow keys and swipe. Uses Bootstrap's carousel
// styles for the frame and arrows; no Bootstrap JS.
import { Children, useState, type ReactNode } from "react";
import { swipeHandlers, useAutoplay } from "@/components/useAutoplay";

export default function Carousel({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const { restart, handlers, reduce } = useAutoplay(() => go(1), 5000, count > 1);
  const move = (step: 1 | -1) => {
    go(step);
    restart();
  };
  if (!count) return null;

  return (
    <div
      className={`carousel slide kit-carousel${className ? " " + className : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") move(-1);
        if (e.key === "ArrowRight") move(1);
      }}
      {...handlers}
      {...swipeHandlers(move)}
    >
      <div className="carousel-inner">
        <div className="kit-carousel__track" style={{ transform: `translateX(${-index * 100}%)`, transition: reduce ? "none" : undefined }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className="kit-carousel__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
              inert={i !== index}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      {count > 1 && (
        <>
          <button className="carousel-control-prev" type="button" onClick={() => move(-1)}>
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" onClick={() => move(1)}>
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}
    </div>
  );
}
