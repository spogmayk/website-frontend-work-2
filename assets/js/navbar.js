


/* ============================================================
   navbar.js — Codemargin Navbar Behaviour  (v2)
   Handles:
     • Scroll-based background change (transparent → frosted dark)
     • Active link highlighting based on current page URL
   Note: No hamburger / mobile drawer — header is always visible.
   ============================================================ */

(function () {
  'use strict';

  const header = document.getElementById('header');
  if (!header) return;


  /* ── 1. Scroll — frosted glass on scroll ─────────────────── */
  const SCROLL_THRESHOLD = 10;   
  let   ticking          = false;

  function updateHeader () {
    header.classList.toggle('header--scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  
  updateHeader();


  /* ── 2. Active nav link — match current page ──────────────── */
  function normalizePath (href) {
    try {
      return new URL(href, window.location.href).pathname.replace(/\/$/, '') || '/';
    } catch (_) {
      return href;
    }
  }

  const currentPath = normalizePath(window.location.href);

  document.querySelectorAll('.nav__link').forEach(function (link) {
    /* Remove the default active class first */
    link.classList.remove('nav__link--active');
    /* Re-apply only if paths match */
    if (normalizePath(link.href) === currentPath) {
      link.classList.add('nav__link--active');
    }
  });

})();


(function () {
  'use strict';

  /* Sticky scroll class */
  let lastScroll = 0;
  const navbar = document.querySelector('.navbar');

  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = current;
  }, { passive: true });

})();