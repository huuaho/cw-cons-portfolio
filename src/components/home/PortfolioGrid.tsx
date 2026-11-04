"use client";

// Project tiles. A click opens the project in place above the grid (the grid fades out, the
// details fade in, a close button brings the grid back), as the template's AJAX view did.
// Tiles are still links to /projects/<slug>/, so new-tab clicks and no-JS visits work.
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import ProjectDetails from "@/components/ProjectDetails";
import type { Project } from "@/lib/content";

const FADE_MS = 500;

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<Project | null>(null);
  const [active, setActive] = useState(false); // details visible
  const [gridHidden, setGridHidden] = useState(false); // grid collapsed after fading out
  const opener = useRef<HTMLAnchorElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const returnFocus = useRef(false); // true while a project is open

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Move focus to the close button on open and back to the tile on close. Waits a frame:
  // the template's `transition: all` keeps an element's visibility "hidden" for the first
  // frame after it is shown, and hidden elements cannot take focus.
  useEffect(() => {
    const target = active ? closeBtn.current : opener.current;
    if (!target || (!active && !returnFocus.current)) return;
    returnFocus.current = active;
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => target.focus({ preventScroll: true })),
    );
    return () => cancelAnimationFrame(frame);
  }, [active]);

  function scrollToSection() {
    const section = document.getElementById("portfolio-section");
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (section) window.scrollTo({ top: section.offsetTop - 50, behavior: smooth ? "smooth" : "auto" });
  }

  function onTileClick(e: MouseEvent<HTMLAnchorElement>, project: Project) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab still works
    e.preventDefault();
    timers.current.forEach(clearTimeout);
    opener.current = e.currentTarget;
    setOpen(project);
    setActive(false);
    setGridHidden(false);
    scrollToSection();
    // Next frame: fade the details in and the grid out, then collapse the grid.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setActive(true)),
    );
    later(() => setGridHidden(true), FADE_MS);
  }

  function close() {
    timers.current.forEach(clearTimeout);
    setGridHidden(false);
    setActive(false);
    scrollToSection();
    later(() => setOpen(null), FADE_MS);
  }

  const showGrid = !active;

  return (
    <>
      <div id="portfolio-single-holder">
        {open && (
          <div
            className={`portfolio-single-inner${active ? " active" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
          >
            <button
              ref={closeBtn}
              type="button"
              className="unslate_co--close-portfolio d-flex align-items-center"
              aria-label="Close project"
              onClick={close}
            >
              <span className="fa-solid fa-xmark wrap-icon-close" aria-hidden="true" />
            </button>
            <ProjectDetails key={open.slug} project={open} headingLevel="h2" />
          </div>
        )}
      </div>

      <div
        className="portfolio-wrapper"
        style={{
          transition: `margin-top ${FADE_MS}ms ease, opacity ${FADE_MS}ms ease`,
          marginTop: showGrid ? 0 : 50,
          opacity: showGrid ? 1 : 0,
          height: gridHidden ? 0 : "auto",
          visibility: gridHidden ? "hidden" : "visible",
          overflow: gridHidden ? "hidden" : undefined,
        }}
        aria-hidden={!showGrid}
      >
        <div id="posts" className="row">
          {projects.map((project, i) => (
            <div key={project.slug} className="item col-sm-6 col-lg-4 isotope-mb-2">
              <Link
                href={`/projects/${project.slug}/`}
                className="portfolio-item isotope-item"
                data-reveal={i < 3 ? undefined : "fade-up"}
                onClick={(e) => onTileClick(e, project)}
              >
                <div className="overlay">
                  <span className="wrap-icon fa-solid fa-link" aria-hidden="true" />
                  <div className="portfolio-item-content">
                    <h3>{project.title}</h3>
                    <p>{[project.category, project.location].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
                <img src={project.cover} className="img-fluid" alt={project.title} loading={i < 3 ? "eager" : "lazy"} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
