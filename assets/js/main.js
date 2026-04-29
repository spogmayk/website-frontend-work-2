
































// Get elements
const hamburger = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('menuOverlay');
const mobileNavList = document.getElementById('mobileNavList');

// Copy desktop nav links into mobile menu
function populateMobileMenu() {
  const desktopLinks = document.querySelectorAll('.nav__list .nav__link');
  mobileNavList.innerHTML = '';
  desktopLinks.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = link.textContent;
    a.href = link.href;
    if (link.classList.contains('nav__link--active')) a.classList.add('nav__link--active');
    a.addEventListener('click', () => setTimeout(() => closeMenu(), 50));
    li.appendChild(a);
    mobileNavList.appendChild(li);
  });
}

function openMenu() {
  mobileMenu.classList.add('open');
  overlay.classList.add('active');
  hamburger.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  overlay.classList.remove('active');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}
function toggleMenu() {
  if (mobileMenu.classList.contains('open')) closeMenu();
  else { populateMobileMenu(); openMenu(); }
}

hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
});

// On window resize above breakpoint, close menu
window.addEventListener('resize', () => {
  if (window.innerWidth > 900 && mobileMenu.classList.contains('open')) closeMenu();
});













/* ============================================================
   main.js — Codemargin Core Logic
   Handles:
     • page-loaded class (fires entrance animations)
     • smooth scroll for anchor links
     • Global utilities
   ============================================================ */































































   

(function () {
  'use strict';

  /* ---- 1. Fire page-load animations ---- */

  /**
   * We add .page-loaded to <body> after a short rAF delay.
   * This ensures fonts have rendered so the first frame of the
   * fadeUp animation isn't a flash of unstyled text.
   *
   * Why not DOMContentLoaded?  — fonts may still be swapping.
   * Why not load?              — too slow, adds perceived lag.
   * rAF on next paint is the sweet spot.
   */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('page-loaded');
    });
  });









  


  /* ---- 2. Smooth scroll for in-page anchor links ---- */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      const headerH  = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72',
        10
      );
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });












  /* ---- 3. Theme toggle ---- */
  (function () {
    const btn  = document.getElementById('themeToggle');
    const html = document.documentElement;
    const KEY  = 'cm-theme';

    // Restore saved preference
    const saved = localStorage.getItem(KEY);
    if (saved) html.setAttribute('data-theme', saved);

    if (!btn) return;

    btn.addEventListener('click', function () {
      const current = html.getAttribute('data-theme') || 'dark';
      const next    = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
    });
  }());



  /* ---- 4. Utility: debounce ---- */
  // Exported on window so other scripts can use it
  window.CM = window.CM || {};

  window.CM.debounce = function (fn, wait) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn.apply.bind(fn, this, arguments), wait);
    };
  };

})();




































