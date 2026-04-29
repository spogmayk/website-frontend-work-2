(function () {
  'use strict';

  const section = document.getElementById('caseStudies');
  if (!section) return;

  const filters = section.querySelectorAll('.case-filter');
  const cards = [...section.querySelectorAll('.case-card')];
  const grid = section.querySelector('.case-studies__grid');
  if (!filters.length || !cards.length) return;

  const filterMap = {
    'All':       null,
    'Selected':  ['TAILORING', 'CROPO', 'VOILATOR'],
    'Digital':   ['TAILORING', 'CROPO', 'PIXFLOW'],
    'Branding':  ['SPANIO', 'HERBAL', 'VOILATOR'],
    'Web':       ['SPANIO', 'HERBAL', 'PIXFLOW']
  };

  function getRects(list) {
    return new Map(list.map(el => [el, el.getBoundingClientRect()]));
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active class
      filters.forEach(f => f.classList.remove('is-active'));
      btn.classList.add('is-active');

      const allowed = filterMap[btn.textContent.trim()];
      const toKeep = [];
      const toHide = [];

      cards.forEach(card => {
        const project = card.getAttribute('data-project');
        (allowed === null || allowed.includes(project) ? toKeep : toHide).push(card);
      });

      // Record old positions of visible cards that will stay
      const visibleKeep = toKeep.filter(c => c.style.display !== 'none');
      const oldRects = getRects(visibleKeep);

      // Apply exit animation to hidden cards
      toHide.forEach(c => {
        c.classList.add('is-exiting');
        c.style.display = ''; // ensure they are visible for exit animation
      });
      toKeep.forEach(c => c.classList.remove('is-exiting'));

      // After exit animation (0.3s), perform layout change
      setTimeout(() => {
        // Hide exiting cards
        toHide.forEach(c => {
          c.style.display = 'none';
          c.classList.remove('is-exiting');
        });

        // Reveal kept cards
        toKeep.forEach(c => {
          c.style.display = '';
          c.classList.remove('is-entering', 'flip-ready');
        });

        // Force reflow to capture new positions
        requestAnimationFrame(() => {
          const newRects = getRects(toKeep);

          // Separate entering vs preserved cards
          const preserved = [];
          const entering = [];
          toKeep.forEach(card => {
            if (oldRects.has(card)) preserved.push(card);
            else entering.push(card);
          });

          // ---- FLIP for preserved cards (staggered) ----
          preserved.forEach((card, i) => {
            const old = oldRects.get(card);
            const new_ = newRects.get(card);
            if (!old || !new_) return;

            const dx = old.left - new_.left;
            const dy = old.top - new_.top;
            const scaleX = old.width / new_.width;
            const scaleY = old.height / new_.height;

            // Invert – add a micro rotation for style
            card.style.transition = 'none';
            card.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX * 0.96}, ${scaleY * 0.96}) rotateY(${(i % 2 === 0 ? 2 : -2)}deg)`;

            card.classList.add('flip-ready');
            card.style.transitionDelay = `${i * 0.04}s`;  // stagger wave

            // Force reflow
            card.offsetHeight;

            // Play – animate to identity
            card.style.transform = '';
          });

          // Clean up after FLIP animation
          setTimeout(() => {
            preserved.forEach(c => {
              c.classList.remove('flip-ready');
              c.style.transitionDelay = '';
            });
          }, 800);

          // ---- Entrance for newly visible cards (staggered pop) ----
          entering.forEach((card, i) => {
            card.classList.add('is-entering');
            card.style.transition = `
              opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.08 + i * 0.06}s,
              transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.08 + i * 0.06}s
            `;
            // Force reflow to apply initial state
            card.offsetHeight;
            // Remove initial hidden classes to trigger animation
            card.classList.remove('is-entering');
          });

          // Clean up entrance delays
          setTimeout(() => {
            entering.forEach(c => {
              c.style.transition = '';
            });
          }, 900);
        });
      }, 310); // slightly longer than exit duration
    });
  });
})();