/*!
 * Colorlib kit: gallery.js (needs PhotoSwipe 5: vendor/photoswipe/5.4.4/umd/photoswipe.umd.min.js,
 * umd/photoswipe-lightbox.umd.min.js and photoswipe.css; optional css/gallery.css for captions)
 *
 * Replaces Magnific Popup (type: 'image'), Fancybox image groups and lightGallery with PhotoSwipe 5.
 *
 * Picked up automatically (links whose href is the big image):
 *   <a href="images/work-1.jpg" class="image-popup">          Magnific (ftco themes): one gallery per page
 *   <a href="img/g1.jpg" class="img-pop-up">                   Magnific (Colorlib "img-pop-up" themes)
 *   <a href="img/1.jpg" class="glightbox" data-gallery="team"> GLightbox: grouped by data-gallery on the link
 *   <a href="…" class="single_gallery_part | gallery-popup | image-link | popup-image | magnific-img">
 *   <a href="…" data-fancybox="gallery">                       grouped by the data-fancybox value
 *   <div data-gallery> <a href="…"><img></a> … </div>          container: its <a> children are one gallery
 *   <div id="gallery" data-gallery="a.item">                   container with a child selector
 * Each class above forms one gallery (Magnific's gallery: { enabled: true }). Put
 * data-gallery-group="name" on links to split them differently.
 *
 * Sizes: PhotoSwipe needs data-pswp-width / data-pswp-height. Links without them are measured by
 * loading the image once (the clicked one before opening, the rest in the background) and the
 * attributes are written back, so a build step can bake them in later.
 * Captions: data-caption, else title, else the thumbnail's alt.
 *
 * Zoom: PhotoSwipe zooms no further than an image's own size by default, so a photo that already
 * fits the screen could not be zoomed at all (a click on it closed the lightbox). lightGallery zoomed
 * any photo, so the kit zooms to at least twice the fitted size (secondaryZoomLevel) and allows up to
 * four times (maxZoomLevel). KitConfig.gallery.options can override both.
 *
 * API: Kit.gallery.bind(links, groupName) · Kit.gallery.open(links, index) · Kit.gallery.init()
 * Reduced motion: no zoom/fade animation.
 */
(function () {
  'use strict';

  const Kit = (window.Kit = window.Kit || {});
  if (Kit.gallery) return;

  const cfg = (window.KitConfig && window.KitConfig.gallery) || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CLASS_GROUPS = cfg.classes || ['image-popup', 'img-pop-up', 'single_gallery_part', 'gallery-popup', 'image-link', 'popup-image', 'magnific-img', 'glightbox'];
  const IMG_RE = /\.(avif|webp|jpe?g|png|gif|svg)(\?.*)?(#.*)?$/i;

  const sizeCache = new Map(); // src -> Promise<{w,h}>
  let current = null; // { lightbox, items }

  function measure(src) {
    if (!sizeCache.has(src)) {
      sizeCache.set(src, new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = src;
      }));
    }
    return sizeCache.get(src);
  }

  function caption(link) {
    const img = link.querySelector('img');
    return link.dataset.caption || link.getAttribute('title') || (img && img.alt) || '';
  }

  function toItem(link) {
    const img = link.querySelector('img');
    return {
      src: link.getAttribute('href') || link.dataset.src,
      width: Number(link.dataset.pswpWidth) || 0,
      height: Number(link.dataset.pswpHeight) || 0,
      alt: (img && img.alt) || link.getAttribute('title') || '',
      caption: caption(link),
      msrc: img ? (img.currentSrc || img.src) : undefined,
      element: link,
      thumbCropped: true,
    };
  }

  function fillSize(item, size) {
    if (!size || item.width) return false;
    item.width = size.w;
    item.height = size.h;
    item.element.dataset.pswpWidth = size.w;
    item.element.dataset.pswpHeight = size.h;
    return true;
  }

  function registerCaption(lightbox) {
    lightbox.on('uiRegister', () => {
      lightbox.pswp.ui.registerElement({
        name: 'kit-caption',
        order: 9,
        isButton: false,
        appendTo: 'root',
        onInit(el, pswp) {
          el.setAttribute('aria-live', 'polite');
          const update = () => {
            const text = (pswp.currSlide && pswp.currSlide.data.caption) || '';
            el.textContent = text;
            el.hidden = !text;
          };
          pswp.on('change', update);
          update();
        },
      });
    });
  }

  async function open(links, index) {
    if (typeof window.PhotoSwipeLightbox !== 'function' || typeof window.PhotoSwipe !== 'function') {
      console.warn('[kit/gallery] PhotoSwipe is not loaded; following the link instead.');
      window.location.href = links[index].getAttribute('href');
      return;
    }
    const items = links.map(toItem);
    const clicked = items[index];
    links[index].setAttribute('aria-busy', 'true');
    if (!clicked.width) fillSize(clicked, await Promise.race([measure(clicked.src), new Promise((r) => setTimeout(r, 4000))]));
    links[index].removeAttribute('aria-busy');

    const lightbox = new window.PhotoSwipeLightbox(Object.assign({
      dataSource: items,
      pswpModule: window.PhotoSwipe,
      showHideAnimationType: reduceMotion.matches ? 'none' : 'zoom',
      bgOpacity: 0.9,
      closeTitle: 'Close (Esc)',
      zoomTitle: 'Zoom',
      arrowPrevTitle: 'Previous image',
      arrowNextTitle: 'Next image',
      errorMsg: 'The image could not be loaded.',
      // Zoom photos that fit the screen too (PhotoSwipe's default stops at the natural size).
      secondaryZoomLevel: (zoom) => Math.max(zoom.fit * 2, Math.min(1, zoom.fit * 3)),
      maxZoomLevel: (zoom) => Math.max(zoom.fit * 4, 1),
    }, cfg.options || {}));
    registerCaption(lightbox);
    lightbox.init();
    current = { lightbox, items };
    lightbox.on('destroy', () => { if (current && current.lightbox === lightbox) current = null; });
    lightbox.loadAndOpen(index);

    // Measure the rest; refresh any slide that was already built with a guessed size.
    items.forEach((item, i) => {
      if (item.width) return;
      measure(item.src).then((size) => {
        if (fillSize(item, size) && lightbox.pswp && !lightbox.pswp.isDestroying) lightbox.pswp.refreshSlideContent(i);
      });
    });
  }

  /** Makes `links` (in order) one gallery. */
  function bind(links) {
    links = Array.from(links).filter((a) => a.getAttribute('href') && !a.dataset.kitGallery);
    links.forEach((link, i) => {
      link.dataset.kitGallery = '1';
      link.addEventListener('click', (e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab clicks through
        e.preventDefault();
        open(links, i);
      });
    });
    return links;
  }

  function init() {
    const byGroup = new Map();
    const add = (name, link) => { if (!byGroup.has(name)) byGroup.set(name, []); byGroup.get(name).push(link); };

    document.querySelectorAll('[data-gallery]').forEach((el, n) => {
      if (el.tagName === 'A') {
        // GLightbox: data-gallery on the link names its group.
        if (IMG_RE.test(el.getAttribute('href') || '') || el.dataset.pswpWidth) add('glightbox-' + el.dataset.gallery, el);
        return;
      }
      const sel = el.getAttribute('data-gallery') || 'a';
      el.querySelectorAll(sel).forEach((a) => add(a.dataset.galleryGroup || 'container-' + n, a));
    });
    CLASS_GROUPS.forEach((cls) => {
      document.querySelectorAll('a.' + cls).forEach((a) => {
        if (IMG_RE.test(a.getAttribute('href') || '') || a.dataset.pswpWidth) add(a.dataset.galleryGroup || 'class-' + cls, a);
      });
    });
    document.querySelectorAll('a[data-fancybox]').forEach((a) => {
      if (IMG_RE.test(a.getAttribute('href') || '')) add('fancybox-' + (a.dataset.fancybox || Math.random()), a);
    });
    document.querySelectorAll('a[data-gallery-group]').forEach((a) => add(a.dataset.galleryGroup, a));

    byGroup.forEach((links) => bind(Array.from(new Set(links))));
  }

  Kit.gallery = {
    init,
    bind,
    open: (links, index) => open(Array.from(links), index || 0),
    get current() { return current; },
  };

  if (cfg.autoInit === false) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
