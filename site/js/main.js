/**
 * Space: the template's own JavaScript (vanilla, no dependencies besides Bootstrap's bundle
 * for the carousels in AJAX-loaded projects). One init function per feature; each returns
 * early when its markup is not on the page.
 *
 * The kit modules in js/kit/ handle the mobile menu, scroll reveals, the gallery lightbox,
 * the video dialog and the skill counters; their options are in js/config.js.
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Light/dark toggle. The saved or system theme is applied by the inline script in <head>
   * before first paint; this wires every .dark-mode-toggle (index and the inner pages). */
  function initThemeToggle() {
    const toggles = document.querySelectorAll('.dark-mode-toggle');
    if (!toggles.length) return;
    const html = document.documentElement;

    const sync = () => {
      const dark = html.getAttribute('data-bs-theme') === 'dark';
      toggles.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(dark));
        const icon = btn.querySelector('span');
        if (icon) icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      });
    };

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-bs-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { /* private mode: not remembered */ }
        sync();
      });
    });
    sync();
  }

  /* Testimonials slider (index): 3 / 2 / 1 cards by width, arrows, swipe, 5 s autoplay.
   * Autoplay pauses on hover, while focus is inside, when the tab is hidden, and never runs
   * with reduced motion. */
  function initTestimonialsSlider() {
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;
    const track = slider.querySelector('.testimonials-track');
    const items = Array.from(slider.querySelectorAll('.item'));
    const prevBtn = slider.querySelector('.slider-prev');
    const nextBtn = slider.querySelector('.slider-next');
    if (!track || !items.length) return;

    let index = 0;
    let perView = getPerView();
    let timer = null;
    let hovered = false;
    let focused = false;

    function getPerView() {
      if (window.innerWidth < 600) return 1;
      if (window.innerWidth < 900) return 2;
      return 3;
    }

    function update() {
      const width = 100 / perView;
      items.forEach((item, i) => {
        item.style.flex = `0 0 ${width}%`;
        item.style.maxWidth = `${width}%`;
        const shown = i >= index && i < index + perView;
        item.setAttribute('aria-hidden', String(!shown));
        item.inert = !shown;
      });
      track.style.transform = `translateX(${-index * width}%)`;
    }

    function go(step) {
      const max = Math.max(0, items.length - perView);
      index = index + step > max ? 0 : index + step < 0 ? max : index + step;
      update();
    }

    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (reduceMotion.matches || hovered || focused || document.hidden) return;
      timer = setInterval(() => go(1), 5000);
    }

    track.style.display = 'flex';
    track.style.transition = reduceMotion.matches ? 'none' : 'transform 0.5s ease';
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-roledescription', 'carousel');
    slider.setAttribute('aria-label', 'Testimonials');
    items.forEach((item, i) => {
      item.setAttribute('role', 'group');
      item.setAttribute('aria-roledescription', 'slide');
      item.setAttribute('aria-label', `${i + 1} of ${items.length}`);
    });
    update();

    if (nextBtn) nextBtn.addEventListener('click', () => { go(1); start(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { go(-1); start(); });

    window.addEventListener('resize', () => {
      const n = getPerView();
      if (n !== perView) { perView = n; index = 0; update(); }
    });

    let touchX = 0;
    track.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].screenX; stop(); }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
      start();
    }, { passive: true });

    slider.addEventListener('mouseenter', () => { hovered = true; stop(); });
    slider.addEventListener('mouseleave', () => { hovered = false; start(); });
    slider.addEventListener('focusin', () => { focused = true; stop(); });
    slider.addEventListener('focusout', (e) => { if (!slider.contains(e.relatedTarget)) { focused = false; start(); } });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    reduceMotion.addEventListener?.('change', () => {
      track.style.transition = reduceMotion.matches ? 'none' : 'transform 0.5s ease';
      start();
    });
    start();
  }

  /* Skill circles (index): an SVG ring that fills to data-percent when scrolled into view.
   * The number inside counts up with the kit's counters.js ([data-to]). */
  function initProgressCircles() {
    const bars = document.querySelectorAll('.progressbar');
    if (!bars.length) return;
    const SIZE = 150;
    const THICKNESS = 4;
    const NS = 'http://www.w3.org/2000/svg';
    const radius = (SIZE - THICKNESS) / 2;
    const circumference = 2 * Math.PI * radius;

    const ring = (bar) => {
      const circle = bar.querySelector('.circle');
      if (!circle) return null;
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', SIZE);
      svg.setAttribute('height', SIZE);
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const make = (stroke) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', SIZE / 2);
        c.setAttribute('cy', SIZE / 2);
        c.setAttribute('r', radius);
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', stroke);
        c.setAttribute('stroke-width', THICKNESS);
        return c;
      };
      const track = make('#eee');
      const fill = make('#ff2e63');
      fill.setAttribute('stroke-linecap', 'round');
      fill.style.strokeDasharray = circumference;
      fill.style.strokeDashoffset = circumference;
      fill.style.transition = reduceMotion.matches ? 'none' : 'stroke-dashoffset 2s ease-out';
      svg.append(track, fill);
      circle.insertBefore(svg, circle.firstChild);
      return () => {
        const percent = parseInt(circle.dataset.percent, 10) || 0;
        fill.style.strokeDashoffset = circumference - (percent / 100) * circumference;
      };
    };

    const fills = new Map();
    bars.forEach((bar) => { const f = ring(bar); if (f) fills.set(bar, f); });
    if (!('IntersectionObserver' in window)) { fills.forEach((f) => f()); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // Next frame, so the empty ring is painted before the transition starts.
        requestAnimationFrame(() => requestAnimationFrame(fills.get(entry.target)));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    fills.forEach((f, bar) => io.observe(bar));
  }

  /* Project view (index): a portfolio tile loads its portfolio-single-*.html page into
   * #portfolio-single-holder with fetch, instead of navigating. From file:// (no fetch)
   * or on any error, the link simply navigates. */
  function initProjectView() {
    const links = document.querySelectorAll('.ajax-load-page');
    const holder = document.getElementById('portfolio-single-holder');
    if (!links.length || !holder) return;
    const section = document.getElementById('portfolio-section');
    const wrapper = document.querySelector('.portfolio-wrapper');
    const loader = document.querySelector('.loader-portfolio-wrap');
    const behavior = () => (reduceMotion.matches ? 'auto' : 'smooth');
    const scrollToSection = () => {
      if (section) setTimeout(() => window.scrollTo({ top: section.offsetTop - 50, behavior: behavior() }), 200);
    };
    let opener = null;

    function close() {
      const view = holder.querySelector('.portfolio-single-inner');
      scrollToSection();
      if (wrapper) {
        wrapper.style.visibility = 'visible';
        wrapper.style.height = 'auto';
        setTimeout(() => { wrapper.style.marginTop = '0'; wrapper.style.opacity = '1'; }, 100);
      }
      if (view) {
        view.classList.remove('active');
        setTimeout(() => view.remove(), 500);
      }
      if (opener) opener.focus({ preventScroll: true });
      opener = null;
    }

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab still works
        if (window.location.protocol === 'file:') return; // fetch is blocked from file://
        e.preventDefault();
        const href = link.getAttribute('href');
        opener = link;
        holder.innerHTML = '';
        if (loader) {
          loader.style.transition = 'top 0.5s ease, opacity 0.5s ease';
          loader.style.display = 'block';
          loader.style.top = '-50px';
          loader.style.opacity = '1';
        }
        scrollToSection();

        fetch(href)
          .then((res) => { if (!res.ok) throw new Error(res.status); return res.text(); })
          .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const content = doc.querySelector('.portfolio-single-wrap .portfolio-single-inner') || doc.querySelector('.portfolio-single-wrap');
            if (!content) throw new Error('no project content');
            // The project title is the h1 of its own page; inside index it is a section heading.
            content.querySelectorAll('h1').forEach((h1) => {
              const h2 = doc.createElement('h2');
              h2.className = h1.className;
              h2.innerHTML = h1.innerHTML;
              h1.replaceWith(h2);
            });

            if (wrapper) {
              wrapper.style.transition = 'margin-top 0.5s ease, opacity 0.5s ease';
              wrapper.style.marginTop = '50px';
              wrapper.style.opacity = '0';
              setTimeout(() => { wrapper.style.height = '0'; wrapper.style.visibility = 'hidden'; }, 500);
            }

            const view = document.createElement('div');
            view.id = 'portfolio-single-' + link.dataset.id;
            view.className = 'portfolio-single-inner';
            view.innerHTML =
              '<button type="button" class="unslate_co--close-portfolio js-close-portfolio d-flex align-items-center" aria-label="Close project">' +
              '<span class="fa-solid fa-xmark wrap-icon-close" aria-hidden="true"></span></button>' +
              content.innerHTML;
            holder.appendChild(view);

            requestAnimationFrame(() => requestAnimationFrame(() => {
              view.classList.add('active');
              if (loader) { loader.style.top = '0'; loader.style.opacity = '0'; }
              initCarousels(view);
              view.querySelector('.js-close-portfolio').focus({ preventScroll: true });
            }));
          })
          .catch(() => { window.location.href = href; });
      });
    });

    holder.addEventListener('click', (e) => { if (e.target.closest('.js-close-portfolio')) close(); });
    holder.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* Bootstrap starts data-bs-ride carousels only on page load, so start the ones that
   * arrive with a project view. */
  function initCarousels(container) {
    if (!window.bootstrap || !window.bootstrap.Carousel) return;
    container.querySelectorAll('.carousel').forEach((el) => {
      window.bootstrap.Carousel.getOrCreateInstance(el, { interval: 5000, ride: reduceMotion.matches ? false : 'carousel' });
    });
  }

  /* Footer year (was an inline document.write). */
  function initYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('.js-year').forEach((el) => { el.textContent = year; });
  }

  function init() {
    initThemeToggle();
    initTestimonialsSlider();
    initProgressCircles();
    initProjectView();
    initYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
