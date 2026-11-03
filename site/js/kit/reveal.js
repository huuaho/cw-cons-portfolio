/*!
 * Colorlib kit: reveal.js (no dependencies; pairs with css/reveal.css)
 *
 * Replaces WOW.js, AOS, and the Waypoints-driven .ftco-animate / .animate-box scripts.
 *
 * Markup it picks up on its own (no per-template JS needed):
 *   <div data-aos="fade-up" data-aos-delay="200" data-aos-duration="800" data-aos-once="false">
 *   <div class="wow fadeInUp" data-wow-delay=".3s" data-wow-duration="1s">
 *   <div class="ftco-animate" data-animate-effect="fadeInLeft">   (default fadeInUp, 50 ms stagger)
 *   <div class="animate-box" data-animate-effect="fadeIn">
 *   <div data-reveal="zoom-in">                                   (kit-native, same names as AOS)
 * AOS names: fade, fade-up/down/left/right, fade-up-right/-up-left/-down-right/-down-left,
 *   zoom-in(-up/-down/-left/-right), zoom-out(...), slide-up/down/left/right, flip-up/down/left/right.
 * Also data-aos-easing (AOS easing names) and data-aos-anchor="#el" (reveal when #el enters).
 *
 * Timing: fires as soon as the element's (untransformed) top enters the viewport, i.e. while it
 * is still in the bottom ~10% of the screen. Never late like AOS's default 120 px offset.
 *
 * Global options, before this script or via Kit.reveal.configure() (the old AOS.init options):
 *   window.KitConfig = { reveal: { duration: 700, easing: 'ease', once: true, delay: 0,
 *                                  distance: 50, stagger: 50, autoInit: true } };
 *
 * API: Kit.reveal.refresh()  – pick up elements added later (AJAX, filters)
 *      Kit.reveal.reveal(el) – reveal one element now
 *
 * No JS  -> everything visible. prefers-reduced-motion -> everything visible, no movement.
 * For no flash on above-the-fold content, add to <head>:
 *   <script>document.documentElement.classList.add('kit-reveal-on')</script>
 */
(function () {
  'use strict';

  const Kit = (window.Kit = window.Kit || {});
  if (Kit.reveal) return;

  const SELECTOR = '[data-aos], [data-reveal], .wow, .ftco-animate, .animate-box';
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const opts = Object.assign(
    { duration: 700, easing: null, once: true, delay: 0, distance: 50, stagger: 50, autoInit: true },
    (window.KitConfig && window.KitConfig.reveal) || {}
  );

  // animate.css entrance names (WOW, ftco, animate-box, slider data-animation) -> AOS vocabulary
  const ANIMATE_CSS = {
    fadeIn: 'fade', fadeInUp: 'fade-up', fadeInUpBig: 'fade-up', fadeInDown: 'fade-down', fadeInDownBig: 'fade-down',
    fadeInLeft: 'fade-right', fadeInLeftBig: 'fade-right', fadeInRight: 'fade-left', fadeInRightBig: 'fade-left',
    fadeInTopLeft: 'fade-down-right', fadeInTopRight: 'fade-down-left', fadeInBottomLeft: 'fade-up-right', fadeInBottomRight: 'fade-up-left',
    zoomIn: 'zoom-in', zoomInUp: 'zoom-in-up', zoomInDown: 'zoom-in-down', zoomInLeft: 'zoom-in-right', zoomInRight: 'zoom-in-left',
    bounceIn: 'zoom-in', bounceInUp: 'fade-up', bounceInDown: 'fade-down', bounceInLeft: 'fade-right', bounceInRight: 'fade-left',
    backInUp: 'fade-up', backInDown: 'fade-down', backInLeft: 'fade-right', backInRight: 'fade-left',
    slideInUp: 'slide-up', slideInDown: 'slide-down', slideInLeft: 'slide-right', slideInRight: 'slide-left',
    flipInX: 'flip-up', flipInY: 'flip-left', lightSpeedIn: 'fade-left', lightSpeedInRight: 'fade-left', lightSpeedInLeft: 'fade-right',
    rotateIn: 'zoom-in', rollIn: 'fade-right', jackInTheBox: 'zoom-in', rubberBand: 'fade', pulse: 'fade', tada: 'fade',
  };

  const EASINGS = {
    linear: 'cubic-bezier(.25,.25,.75,.75)', ease: 'cubic-bezier(.25,.1,.25,1)', 'ease-in': 'cubic-bezier(.42,0,1,1)',
    'ease-out': 'cubic-bezier(0,0,.58,1)', 'ease-in-out': 'cubic-bezier(.42,0,.58,1)',
    'ease-in-back': 'cubic-bezier(.6,-.28,.735,.045)', 'ease-out-back': 'cubic-bezier(.175,.885,.32,1.275)',
    'ease-in-out-back': 'cubic-bezier(.68,-.55,.265,1.55)', 'ease-out-quad': 'cubic-bezier(.25,.46,.45,.94)',
    'ease-out-cubic': 'cubic-bezier(.25,.46,.45,.94)', 'ease-in-out-quad': 'cubic-bezier(.455,.03,.515,.955)',
  };

  /** "0.3s" | ".3s" | "300ms" | "300" -> ms (number) or null */
  function toMs(value) {
    if (value == null || value === '') return null;
    const n = parseFloat(value);
    if (Number.isNaN(n)) return null;
    return /\ds\s*$/.test(String(value).trim()) && !/ms\s*$/.test(value) ? n * 1000 : n;
  }

  /** Works out effect/delay/duration/once from whichever plugin's markup the element uses. */
  function describe(el) {
    const d = el.dataset;
    if (d.aos != null || d.reveal != null) {
      return {
        type: d.aos || d.reveal || 'fade',
        delay: toMs(d.aosDelay || d.revealDelay),
        duration: toMs(d.aosDuration || d.revealDuration),
        once: (d.aosOnce || d.revealOnce) ? (d.aosOnce || d.revealOnce) !== 'false' : null,
        anchor: d.aosAnchor || null,
        stagger: false,
      };
    }
    if (el.classList.contains('wow')) {
      const name = Array.from(el.classList).find((c) => /^[a-z]+In[A-Z]?/.test(c) || ANIMATE_CSS[c]);
      return { type: ANIMATE_CSS[name] || 'fade-up', delay: toMs(d.wowDelay), duration: toMs(d.wowDuration), once: true, stagger: false };
    }
    // .ftco-animate / .animate-box: the Colorlib Waypoints pattern, fadeInUp by default, staggered.
    return { type: ANIMATE_CSS[d.animateEffect] || 'fade-up', delay: null, duration: null, once: true, stagger: true };
  }

  const state = new WeakMap(); // el -> description
  const anchors = new Map(); // anchor el -> [elements]
  let io = null;

  function arm(el) {
    const info = describe(el);
    state.set(el, info);
    el.setAttribute('data-kit-reveal', info.type);
    if (info.delay != null) el.style.setProperty('--kit-reveal-el-delay', info.delay + 'ms');
    if (info.duration != null) el.style.setProperty('--kit-reveal-el-duration', info.duration + 'ms');
    return info;
  }

  function cleanup(el) {
    el.removeAttribute('data-kit-reveal');
    el.style.removeProperty('--kit-reveal-el-delay');
    el.style.removeProperty('--kit-reveal-el-duration');
  }

  function reveal(el, extraDelay) {
    const info = state.get(el) || arm(el);
    if (extraDelay) {
      el.style.setProperty('--kit-reveal-el-delay', ((info.delay || opts.delay || 0) + extraDelay) + 'ms');
    }
    el.classList.add('is-revealed', 'ftco-animated'); // ftco-animated: some themes key styles off it
    const once = info.once == null ? opts.once : info.once;
    if (!once) return; // keep armed so it can hide again
    // Hand styling back to the theme after the transition (so hover transforms/transitions work).
    const total = (info.duration || opts.duration) + (info.delay || opts.delay || 0) + (extraDelay || 0) + 100;
    setTimeout(() => cleanup(el), total);
    if (io) io.unobserve(el);
  }

  function hide(el) {
    el.classList.remove('is-revealed', 'ftco-animated');
  }

  function onIntersect(entries) {
    let batch = 0;
    entries.forEach((entry) => {
      const targets = anchors.get(entry.target) || [entry.target];
      targets.forEach((el) => {
        const info = state.get(el);
        if (!info) return;
        if (entry.isIntersecting) {
          if (el.classList.contains('is-revealed')) return;
          reveal(el, info.stagger ? batch++ * opts.stagger : 0);
        } else if ((info.once == null ? !opts.once : !info.once) && entry.boundingClientRect.top > 0) {
          hide(el); // AOS once:false — re-animate when scrolled back into view from above
        }
      });
    });
  }

  function applyGlobals() {
    if (opts.duration) root.style.setProperty('--kit-reveal-duration', opts.duration + 'ms');
    if (opts.distance != null) root.style.setProperty('--kit-reveal-distance', opts.distance + 'px');
    if (opts.easing) root.style.setProperty('--kit-reveal-easing', EASINGS[opts.easing] || opts.easing);
  }

  function refresh() {
    const els = document.querySelectorAll(SELECTOR);
    if (!els.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      els.forEach((el) => { cleanup(el); el.classList.add('is-revealed', 'ftco-animated'); });
      return;
    }

    if (!io) {
      // Bottom margin = the hidden-state translate, so the trigger follows the element's real
      // position rather than its shifted-down box.
      io = new IntersectionObserver(onIntersect, { rootMargin: `0px 0px ${opts.distance}px 0px`, threshold: 0 });
    }

    els.forEach((el) => {
      if (state.has(el) || el.classList.contains('is-revealed')) return;
      const info = arm(el);
      const anchor = info.anchor && document.querySelector(info.anchor);
      if (anchor) {
        if (!anchors.has(anchor)) { anchors.set(anchor, []); io.observe(anchor); }
        anchors.get(anchor).push(el);
      } else {
        io.observe(el);
      }
    });
  }

  function init() {
    root.classList.add('kit-reveal-on');
    applyGlobals();
    refresh();
    // If the user switches reduced motion on mid-visit, show everything.
    reduceMotion.addEventListener?.('change', (e) => {
      if (e.matches) document.querySelectorAll('[data-kit-reveal]').forEach((el) => { cleanup(el); el.classList.add('is-revealed'); });
    });
  }

  Kit.reveal = {
    init,
    refresh,
    reveal: (el) => reveal(el, 0),
    /** Same keys as AOS.init(): duration, easing, once, delay, plus distance and stagger. */
    configure(options) { Object.assign(opts, options || {}); applyGlobals(); },
    /** Maps an animate.css / WOW class name to the kit's effect name (used by sliders.js). */
    effectFor: (name) => ANIMATE_CSS[name] || name || 'fade-up',
  };

  if (opts.autoInit === false) return;
  // Hide as early as possible (this script may be in <head> with defer, or at the end of <body>).
  if (!reduceMotion.matches) root.classList.add('kit-reveal-on');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
