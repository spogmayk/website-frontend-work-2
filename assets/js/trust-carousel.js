(function () {
  'use strict';

  var root = document.getElementById('trustCarousel');
  if (!root) return;

  var viewport = root.querySelector('[data-slider-viewport]');
  var track = root.querySelector('[data-slider-track]');
  var prevBtn = root.querySelector('[data-slider-prev]');
  var nextBtn = root.querySelector('[data-slider-next]');
  var originals = Array.prototype.slice.call(track.querySelectorAll('[data-slide]'));
  if (!viewport || !track || originals.length < 2) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoplayDelay = prefersReducedMotion ? 0 : 4200;
  var duration = 860;
  var currentIndex = 1;
  var cardWidth = 0;
  var timer = null;
  var isAnimating = false;
  var startX = null;
  var deltaX = 0;

  function cloneSlides() {
    var firstClone = originals[0].cloneNode(true);
    var lastClone = originals[originals.length - 1].cloneNode(true);
    firstClone.setAttribute('data-clone', 'first');
    lastClone.setAttribute('data-clone', 'last');
    track.insertBefore(lastClone, originals[0]);
    track.appendChild(firstClone);
  }

  function updateWidth() {
    cardWidth = viewport.clientWidth;
    if (!cardWidth) return;
    jumpTo(currentIndex, false);
  }

  function jumpTo(index, withTransition) {
    if (withTransition) {
      track.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.22, 1, 0.36, 1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = 'translate3d(' + (-index * cardWidth) + 'px, 0, 0)';
  }

  function slideTo(index) {
    if (isAnimating || !cardWidth) return;
    isAnimating = true;
    currentIndex = index;
    jumpTo(currentIndex, true);
  }

  function handleLoopReset() {
    var maxIndex = originals.length;
    if (currentIndex === 0) {
      currentIndex = maxIndex;
      jumpTo(currentIndex, false);
    } else if (currentIndex === maxIndex + 1) {
      currentIndex = 1;
      jumpTo(currentIndex, false);
    }
    isAnimating = false;
  }

  function next() {
    slideTo(currentIndex + 1);
  }

  function prev() {
    slideTo(currentIndex - 1);
  }

  function stopAuto() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  function startAuto() {
    if (autoplayDelay <= 0) return;
    stopAuto();
    timer = setInterval(next, autoplayDelay);
  }

  function onManualNav(direction) {
    stopAuto();
    if (direction === 'next') next();
    if (direction === 'prev') prev();
    startAuto();
  }

  function onPointerDown(e) {
    startX = e.clientX;
    deltaX = 0;
    stopAuto();
    viewport.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (startX === null) return;
    deltaX = e.clientX - startX;
  }

  function onPointerUp() {
    if (startX === null) return;
    var threshold = Math.min(70, cardWidth * 0.14);
    if (deltaX > threshold) prev();
    else if (deltaX < -threshold) next();
    startX = null;
    deltaX = 0;
    startAuto();
  }

  cloneSlides();
  updateWidth();

  track.addEventListener('transitionend', handleLoopReset);
  window.addEventListener('resize', updateWidth, { passive: true });

  if (prevBtn) prevBtn.addEventListener('click', function () { onManualNav('prev'); });
  if (nextBtn) nextBtn.addEventListener('click', function () { onManualNav('next'); });

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);
  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', startAuto);

  startAuto();
}());
