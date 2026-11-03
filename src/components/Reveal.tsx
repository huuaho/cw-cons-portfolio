"use client";

// Scroll reveals for [data-reveal] elements, using the template's kit-reveal CSS.
// Re-runs on every route change so project pages animate too.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DURATION_MS = 600;

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    els.forEach((el) => el.setAttribute("data-kit-reveal", el.dataset.reveal || "fade-up"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add("is-revealed");
          io.unobserve(el);
          // Hand styling back to the theme once the transition is done (hover effects).
          setTimeout(() => el.removeAttribute("data-kit-reveal"), DURATION_MS + 100);
        });
      },
      { rootMargin: "0px 0px 20px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
