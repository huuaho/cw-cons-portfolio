/*
 * Space: options for the kit modules in js/kit/. Loaded before them, because each module
 * reads window.KitConfig when it starts.
 */
window.KitConfig = {
  // Scroll reveals (was an IntersectionObserver on .gsap-reveal-*: 0.6s ease-out, 20px rise).
  reveal: { duration: 600, easing: 'ease-out', distance: 20, once: true },
  // The inner pages show the burger below 992px (d-lg-none); index shows it at every width.
  mobileNav: { breakpoint: 992, label: 'Menu' },
};
