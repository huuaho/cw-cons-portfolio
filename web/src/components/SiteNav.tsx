"use client";

// Top bar, as the template had it:
// - Home page: logo, light/dark toggle and the burger at every width (no inline menu).
// - Inner pages: inline menu from 992px with the current section marked; the toggle shows from
//   992px and the burger below it.
// The burger opens a slide-in menu (a modal <dialog>, styled by the template's kit-mobile-nav
// CSS) with expandable submenus. "Our work" lists the projects.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState, useSyncExternalStore } from "react";

type NavItem = { href: string; label: string; children?: NavItem[] };

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.getAttribute("data-bs-theme") === "dark";

function MobileSubmenu({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const label = `${open ? "Hide" : "Show"} submenu: ${item.label}`;
  return (
    <li className="kit-mobile-nav__has-sub">
      <Link href={item.href} className="nav-link" onClick={onNavigate}>
        {item.label}
      </Link>
      <button
        type="button"
        className="kit-mobile-nav__sub-toggle"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" />
      </button>
      <ul id={id} className="kit-mobile-nav__sub" hidden={!open}>
        {item.children!.map((child) => (
          <li key={child.href}>
            <Link href={child.href} className="nav-link" onClick={onNavigate}>
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function SiteNav({
  logoText,
  projects,
  labels,
}: {
  logoText: string;
  projects: { slug: string; title: string }[];
  labels: { portfolio: string; services: string; about: string; contact: string };
}) {
  // With trailingSlash the path may end in "/"; compare without it.
  const pathname = usePathname().replace(/(.)\/$/, "$1");
  const isHome = pathname === "/";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);

  const items: NavItem[] = [
    { href: "/#home-section", label: "Home" },
    {
      href: "/#portfolio-section",
      label: labels.portfolio,
      children: projects.map((p) => ({ href: `/projects/${p.slug}/`, label: p.title })),
    },
    { href: "/#services-section", label: labels.services },
    { href: "/#about-section", label: labels.about },
    { href: "/#contact-section", label: labels.contact },
  ];
  // The template marked Home active on the home page and Portfolio on project pages.
  const activeHref = isHome ? "/#home-section" : "/#portfolio-section";

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
    dialog.querySelector<HTMLElement>(".kit-mobile-nav__body a")?.focus();
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

  const navigate = () => dialogRef.current?.close();

  return (
    <>
      <nav className="site-nav dark mb-5 site-navbar-target">
        <div className="container">
          <div className="site-navigation">
            <Link href="/" className="logo m-0">
              {logoText}
              <span className="text-primary">.</span>
            </Link>

            {!isHome && (
              <ul className="d-none d-lg-inline-block site-menu float-end">
                {items.map((item) => (
                  <li key={item.href} className={item.children?.length ? "has-children" : undefined}>
                    <Link href={item.href} className={`nav-link${item.href === activeHref ? " active" : ""}`}>
                      {item.label}
                    </Link>
                    {item.children && item.children.length > 0 && (
                      <ul className="dropdown">
                        {item.children.map((child) => (
                          <li key={child.href} className={`${pathname}/` === child.href ? "active" : undefined}>
                            <Link href={child.href} className="nav-link">
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className={`btn btn-sm ms-3 dark-mode-toggle${isHome ? "" : " d-none d-lg-inline-flex"}`}
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
              className={`burger ms-auto float-end site-menu-toggle d-inline-block${isHome ? "" : " d-lg-none"}`}
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
              {items.map((item) =>
                item.children?.length ? (
                  <MobileSubmenu key={item.href} item={item} onNavigate={navigate} />
                ) : (
                  <li key={item.href}>
                    <Link href={item.href} className={`nav-link${item.href === activeHref ? " active" : ""}`} onClick={navigate}>
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
