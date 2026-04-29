
/* =========================================================
   CAROUSEL – ONE CARD AT A TIME, EVERY 5 SECONDS
   Infinite loop, no pause on hover, smooth snap
   ========================================================= */

(function () {
  'use strict';

  const track       = document.getElementById('carouselTrack');
  const wrapper     = document.getElementById('carouselWrapper');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  

  let cards         = [];
  let totalCards    = 0;
  let cardWidth     = 0;      // includes gap
  let currentIndex  = 0;      // logical index (0 = first real card)
  let autoInterval  = null;
  let isTransitioning = false;
  let clonedCount   = 3;      // number of clones on each side

  /* --- Build clones for infinite loop --- */
  function buildClones() {
   
    track.querySelectorAll('.card-clone').forEach(c => c.remove());

    const originalCards = Array.from(track.querySelectorAll('.service-card:not(.card-clone)'));
    totalCards = originalCards.length;

    // Prepend last 'clonedCount' cards as clones
    for (let i = totalCards - 1; i >= totalCards - clonedCount; i--) {
      const clone = originalCards[i].cloneNode(true);
      clone.classList.add('card-clone');
      track.prepend(clone);
    }
    // Append first 'clonedCount' cards as clones
    for (let i = 0; i < clonedCount; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.classList.add('card-clone');
      track.appendChild(clone);
    }

    // Update cards array (includes clones)
    cards = Array.from(track.querySelectorAll('.service-card'));
  }

  /* --- Get width of one real card + gap --- */
  function updateCardWidth() {
    const realCard = document.querySelector('.service-card:not(.card-clone)');
    if (!realCard) return;
    const style = getComputedStyle(realCard);
    const flexBasis = parseFloat(style.flexBasis);
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    // gap is applied via flex gap, but we need to include it
    const gap = 24; // 1.5rem in px (match CSS)
    cardWidth = realCard.offsetWidth + gap;
  }

  /* --- Apply transform based on currentIndex (without transition for instant jumps) --- */
  function setTransform(animate = true) {
    if (!track || cardWidth === 0) return;
    // The visible area starts after the first 'clonedCount' clones.
    // We want to show card at (clonedCount + currentIndex) in the DOM.
    const domIndex = clonedCount + currentIndex;
    const translateX = -(domIndex * cardWidth);
    if (animate) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(${translateX}px)`;
  }

  /* --- Reset position after transition to maintain infinite illusion --- */
  function handleLoopReset() {
    // After transition ends, check if we are at clone boundaries and reset index silently
    if (currentIndex >= totalCards) {
      // We moved past last real card -> jump to first real card
      currentIndex = 0;
      setTransform(false);
    } else if (currentIndex < 0) {
      // Moved before first real card -> jump to last real card
      currentIndex = totalCards - 1;
      setTransform(false);
    }
  }

  /* --- Move by delta cards (positive = right/next, negative = left/prev) --- */
  function moveBy(delta) {
    if (isTransitioning) return;
    isTransitioning = true;

    const newIndex = currentIndex + delta;
    currentIndex = newIndex;

    setTransform(true);

    // Wait for transition to finish, then handle loop reset
    setTimeout(() => {
      handleLoopReset();
      isTransitioning = false;
    }, 520); // slightly longer than transition (500ms)
  }

  /* --- Auto-scroll: one card every 5 seconds --- */
  function startAutoScroll() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(() => {
      if (!isTransitioning) {
        moveBy(1); // move right (next card)
      }
    }, 5000);
  }

  function stopAutoScroll() {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  }

  /* --- Event listeners (buttons, swipe, no hover pause) --- */
  function bindEvents() {
    if (prevBtn) prevBtn.addEventListener('click', () => moveBy(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveBy(1));

    // Swipe support (touch)
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    wrapper.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) moveBy(1);   // swipe left -> next
        else moveBy(-1);          // swipe right -> prev
      }
    });

    // No pause on hover – do nothing.
    // (Intentional: auto scroll continues even when mouse over carousel)
  }

  /* --- Resize handler: recalc card width and reposition --- */
  function onResize() {
    updateCardWidth();
    setTransform(false); // snap to current index without animation
  }

  /* --- Initialisation --- */
  function initCarousel() {
    buildClones();
    updateCardWidth();
    // Start at first real card
    currentIndex = 0;
    setTransform(false);
    bindEvents();
    startAutoScroll();
    window.addEventListener('resize', onResize);
  }

  // Start everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }




/* =========================================================
     CUSTOM CURSOR
  ========================================================= */
  let cx = 0, cy = 0;
  let cursorVisible = false;

  function updateCursorPos (e) {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  }

  wrapper.addEventListener('mousemove', e => {
    updateCursorPos(e);
    if (!cursorVisible) {
      cursorVisible = true;
      cursor.classList.add('visible');
    }
  });

  wrapper.addEventListener('mouseleave', () => {
    cursorVisible = false;
    cursor.classList.remove('visible');
  });
});