"use client";

// Photo carousel on a project page, using Bootstrap's carousel styles (no Bootstrap JS).
import { useState } from "react";

export default function ProjectPhotos({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);

  return (
    <div className="carousel slide" aria-roledescription="carousel" aria-label={`${title} photos`}>
      <div className="carousel-inner">
        {photos.map((src, i) => (
          <div
            key={src + i}
            className={`carousel-item${i === index ? " active" : ""}`}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${photos.length}`}
          >
            <figure className="mb-4">
              <img
                src={src}
                alt={`${title}, photo ${i + 1}`}
                className="img-fluid d-block w-100"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </figure>
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" onClick={() => go(-1)}>
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous photo</span>
          </button>
          <button className="carousel-control-next" type="button" onClick={() => go(1)}>
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next photo</span>
          </button>
        </>
      )}
    </div>
  );
}
