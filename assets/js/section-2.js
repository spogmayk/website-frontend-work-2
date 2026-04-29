/* ===== AGENCY SECTION – PART 2 JS ===== */


(function () {

  /* ── Floating particles on each card canvas ── */
  function initCanvas(canvas) {
    const ctx    = canvas.getContext('2d');
    const isFront = canvas.dataset.card === 'front';
    let W, H, particles;

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
    }

    function makeParticle() {
      return {
        x:     Math.random() * (W || 300),
        y:     Math.random() * (H || 400),
        r:     Math.random() * 2 + 0.6,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:    -(Math.random() * 0.5 + 0.15),
        alpha: Math.random() * 0.5 + 0.15,
        life:  Math.random(),
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: isFront ? 28 : 18 }, makeParticle);
    }

    function drawStreak(ctx, x, y, len, alpha) {
      const grad = ctx.createLinearGradient(x, y, x + len, y - len * 0.3);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 0.8;
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y - len * 0.3);
      ctx.stroke();
    }

    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* light streaks – slow drift */
      if (frame % 180 === 0 || frame === 1) {
        /* redraw streak once in a while */
      }
      const streakAlpha = 0.07 + Math.sin(frame * 0.008) * 0.04;
      drawStreak(ctx, W * 0.1, H * 0.4, W * 0.55, streakAlpha);
      drawStreak(ctx, W * 0.3, H * 0.65, W * 0.4, streakAlpha * 0.6);

      /* particles */
      particles.forEach((p, i) => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.life += 0.004;

        const pulse = Math.sin(p.life * Math.PI) * p.alpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isFront
          ? `rgba(180,200,255,${pulse})`
          : `rgba(255,210,180,${pulse * 0.7})`;
        ctx.fill();

        /* reset when off screen or life done */
        if (p.y < -10 || p.life >= 1) {
          particles[i] = { ...makeParticle(), y: H + 4, life: 0 };
        }
      });

      frame++;
      requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', () => { resize(); });
  }

  document.querySelectorAll('.card-canvas').forEach(initCanvas);

  /* ── Animated progress bars (IntersectionObserver) ── */
  const barFills = document.querySelectorAll('.bar-fill');
  const barPcts  = document.querySelectorAll('.bar-pct');

  /* Populate data-label and data-pct attrs for CSS ::before/::after */
  barFills.forEach((fill, i) => {
    const label  = fill.closest('.bar-group').querySelector('.bar-label').textContent;
    const target = parseInt(fill.dataset.width, 10);
    fill.setAttribute('data-label', label);
    fill.setAttribute('data-pct', target + '%');
  });

  function animateBars() {
    barFills.forEach((fill, i) => {
      const target = parseInt(fill.dataset.width, 10);
      const pctEl  = barPcts[i];
      setTimeout(() => {
        fill.style.width = target + '%';
        /* count-up number */
        let current = 0;
        const step  = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          if (pctEl) pctEl.textContent = current + '%';
          if (current >= target) clearInterval(timer);
        }, 22);
      }, i * 200);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateBars();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const barsSection = document.querySelector('.agency-bars');
  if (barsSection) observer.observe(barsSection);

})();
/* ===== END AGENCY SECTION – PART 2 JS ===== */






/* ===== PARTNERS SECTION – PART 3 JS ===== */
(function () {

  const section = document.getElementById('partnersSection');
  const toggle  = document.getElementById('themeToggle');
  if (!section || !toggle) return;

  /* ── Persist preference ── */
  const STORAGE_KEY = 'partners-theme';
  const saved = localStorage.getItem(STORAGE_KEY);

  function applyTheme(dark) {
    section.classList.toggle('dark-mode', dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }

  /* Load saved or system preference */
  if (saved === 'dark') {
    applyTheme(true);
  } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme(true);
  }

  toggle.addEventListener('click', () => {
    applyTheme(!section.classList.contains('dark-mode'));
  });

  
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches);
    });

})();
/* ===== END PARTNERS SECTION – PART 3 JS ===== */
