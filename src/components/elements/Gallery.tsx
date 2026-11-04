"use client";

// Photo grid that opens in a PhotoSwipe lightbox (the template's kit/gallery.js): zooms to at
// least twice the fitted size, up to four times; captions from the alt text; no animation with
// reduced motion. Links point at the full image, so it still works without JavaScript.
import { useEffect, useRef } from "react";
import "photoswipe/style.css";

type Photo = { src: string; width: number; height: number; alt: string };

export default function Gallery({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let lightbox: { destroy: () => void } | null = null;
    (async () => {
      const { default: PhotoSwipeLightbox } = await import("photoswipe/lightbox");
      if (destroyed || !ref.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lb = new PhotoSwipeLightbox({
        gallery: ref.current,
        children: "a",
        pswpModule: () => import("photoswipe"),
        showHideAnimationType: reduce ? "none" : "zoom",
        bgOpacity: 0.9,
        secondaryZoomLevel: (zoom: { fit: number }) => Math.max(2 * zoom.fit, 1),
        maxZoomLevel: (zoom: { fit: number }) => Math.max(4 * zoom.fit, 1),
        closeTitle: "Close (Esc)",
        zoomTitle: "Zoom",
      });
      lb.on("uiRegister", () => {
        lb.pswp?.ui?.registerElement({
          name: "kit-caption",
          order: 9,
          isButton: false,
          appendTo: "root",
          onInit: (el, pswp) => {
            el.setAttribute("aria-live", "polite");
            const update = () => {
              const img = pswp.currSlide?.data.element?.querySelector("img");
              const text = img?.getAttribute("alt") ?? "";
              el.textContent = text;
              el.hidden = !text;
            };
            pswp.on("change", update);
            update();
          },
        });
      });
      lb.init();
      lightbox = lb;
    })();
    return () => {
      destroyed = true;
      lightbox?.destroy();
    };
  }, []);

  return (
    <div className="row gutter-v2 gallery" ref={ref}>
      {photos.map((p) => (
        <div key={p.src} className="col-4">
          <a href={p.src} className="gal-item" data-pswp-width={p.width} data-pswp-height={p.height}>
            <img loading="lazy" src={p.src} alt={p.alt} className="img-fluid" />
          </a>
        </div>
      ))}
    </div>
  );
}
