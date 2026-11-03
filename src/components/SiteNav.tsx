"use client";

// Top bar: logo, light/dark toggle and the slide-in menu (a modal <dialog>, styled by the
// template's kit-mobile-nav CSS). Replaces the template's main.js toggle and mobile-nav.js.
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";

const LINKS = [
  { href: "/#home-section", label: "Home" },
  { href: "/#services-section", label: "Services" },
  { href: "/#portfolio-section", label: "Our work" },
  { href: "/#about-section", label: "About" },
  { href: "/#contact-section", label: "Contact" },
];

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.getAttribute("data-bs-theme") === "dark";

export default function SiteNav({ logoText }: { logoText: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);

  function toggleTheme() {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode: the choice is not remembered.
    }
  }

  function openMenu() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    document.documentElement.classList.add("kit-mobile-nav-open");
    toggleRef.current?.setAttribute("aria-expanded", "true");
  }

  // Slide out before closing, as the template did.
  function closeMenu() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }
    dialog.classList.add("is-closing");
    const panel = dialog.querySelector<HTMLElement>(".kit-mobile-nav__panel");
    const seconds = panel ? parseFloat(getComputedStyle(panel).transitionDuration) || 0 : 0;
    setTimeout(() => {
      dialog.classList.remove("is-closing");
      if (dialog.open) dialog.close();
    }, seconds * 1000);
  }

  function onClosed() {
    document.documentElement.classList.remove("kit-mobile-nav-open");
    toggleRef.current?.setAttribute("aria-expanded", "false");
    toggleRef.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <nav className="site-nav dark mb-5 site-navbar-target">
        <div className="container">
          <div className="site-navigation">
            <Link href="/" className="logo m-0">
              {logoText}
              <span className="text-primary">.</span>
            </Link>

            <button
              type="button"
              className="btn btn-sm ms-3 dark-mode-toggle"
              aria-label="Toggle dark mode"
              aria-pressed={dark}
              onClick={toggleTheme}
            >
              <span className={dark ? "fa-solid fa-sun" : "fa-solid fa-moon"} aria-hidden="true" />
            </button>

            <button
              ref={toggleRef}
              type="button"
              aria-label="Open menu"
              aria-controls="site-menu"
              aria-expanded="false"
              aria-haspopup="dialog"
              className="burger ms-auto float-end site-menu-toggle d-inline-block"
              onClick={openMenu}
            >
              <span />
            </button>
          </div>
        </div>
      </nav>

      <dialog
        ref={dialogRef}
        id="site-menu"
        className="kit-mobile-nav kit-mobile-nav--right"
        aria-label="Menu"
        onClose={onClosed}
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu(); // backdrop
        }}
      >
        <div className="kit-mobile-nav__panel">
          <div className="kit-mobile-nav__head">
            <button type="button" className="kit-mobile-nav__close" aria-label="Close menu" onClick={closeMenu}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <nav className="kit-mobile-nav__body" aria-label="Menu">
            <ul className="site-menu kit-mobile-nav__list">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="nav-link" onClick={() => dialogRef.current?.close()}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
