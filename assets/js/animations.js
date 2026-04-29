/* ============================================================
   animations.js — Codemargin Animation Engine
   Handles:
     • Hero canvas particle system
     • Cursor glow tracking (desktop)
     • Intersection Observer scroll-reveal
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CONFIG = {
    particleCount : prefersReducedMotion ? 0 : 130,   
    maxRadius     : 3.8,
    minRadius     : 1.2,
    speed         : 0.22,
    linkDistance  : 160,
    linkOpacity   : 0.42,
    particleColor : '255, 255, 255',
    lineColor     : '100, 200, 255',
  };

  let particles = [];
  let animId;
  let W, H;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width  || window.innerWidth;
    H = canvas.height = rect.height || window.innerHeight;
  }

  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.5 + 0.15) * CONFIG.speed;
    return {
      x     : Math.random() * W,
      y     : Math.random() * H,
      r     : Math.random() * (CONFIG.maxRadius - CONFIG.minRadius) + CONFIG.minRadius,
      vx    : Math.cos(angle) * speed,
      vy    : Math.sin(angle) * speed,
      alpha : Math.random() * 0.5 + 0.5,
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -p.r)  p.x = W + p.r;
      if (p.x > W + p.r) p.x = -p.r;
      if (p.y < -p.r)  p.y = H + p.r;
      if (p.y > H + p.r) p.y = -p.r;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.particleColor}, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.linkDistance) {
          const strength = (1 - dist / CONFIG.linkDistance) * CONFIG.linkOpacity;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${strength})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });

  function init() {
    resize();
    initParticles();
    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', function () {
    resize();
    initParticles();
  }, { passive: true });

  init();
})();

  /* ============================================================
     2. CANVAS WAVE — Hero bottom divider
     Two overlapping sine curves animate at the hero's bottom.
     Front layer reads --clr-wave CSS var for theme-awareness.
     Performance-safe: pauses on hidden tab, skipped if
     prefers-reduced-motion is set.
     ============================================================ */

  const waveCanvas = document.getElementById('waveCanvas');

  if (waveCanvas && !prefersReducedMotion) {
    const wctx    = waveCanvas.getContext('2d');
    let wW, wH, waveAnimId;
    let t = 0;

    function resizeWave() {
      wW = waveCanvas.width  = waveCanvas.offsetWidth  || window.innerWidth;
      wH = waveCanvas.height = waveCanvas.offsetHeight || 120;
    }

    function getWaveStyles() {
      const styles = getComputedStyle(document.documentElement);
      return {
        front: styles.getPropertyValue('--clr-wave').trim() || '#ffffff',
        back: styles.getPropertyValue('--clr-wave-back').trim() || 'rgba(255,255,255,0.26)',
        edge: styles.getPropertyValue('--clr-wave-edge').trim() || 'rgba(168,214,255,0.58)',
        edgeSoft: styles.getPropertyValue('--clr-wave-edge-soft').trim() || 'rgba(255,255,255,0.22)',
      };
    }

    function traceBackWavePath() {
      wctx.beginPath();
      wctx.moveTo(0, wH);
      for (let x = 0; x <= wW; x += 4) {
        const y = wH * 0.38
          + Math.sin((x / wW) * Math.PI * 3.2 + t * 0.7)         * (wH * 0.22)
          + Math.sin((x / wW) * Math.PI * 6   + t * 0.4 + 1.1)   * (wH * 0.09);
        wctx.lineTo(x, y);
      }
      wctx.lineTo(wW, wH);
      wctx.closePath();
    }

    function traceFrontWavePath() {
      wctx.beginPath();
      wctx.moveTo(0, wH);
      for (let x = 0; x <= wW; x += 4) {
        const y = wH * 0.52
          + Math.sin((x / wW) * Math.PI * 2.6 + t + Math.PI * 0.7)   * (wH * 0.24)
          + Math.sin((x / wW) * Math.PI * 4.8 + t * 0.6 + 0.5)       * (wH * 0.10);
        wctx.lineTo(x, y);
      }
      wctx.lineTo(wW, wH);
      wctx.closePath();
    }

    function drawWaveFrame() {
      wctx.clearRect(0, 0, wW, wH);
      const palette = getWaveStyles();

      /* ── Back wave — translucent, slower, phase offset ── */
      traceBackWavePath();
      wctx.fillStyle = palette.back;
      wctx.fill();

      /* ── Front wave — solid, faster, different frequency ── */
      traceFrontWavePath();
      wctx.fillStyle = palette.front;
      wctx.fill();

      /* ── Edge glow — subtle illumination in both themes ── */
      traceFrontWavePath();
      wctx.save();
      wctx.shadowColor = palette.edge;
      wctx.shadowBlur = 16;
      wctx.lineWidth = 1.25;
      wctx.strokeStyle = palette.edge;
      wctx.stroke();
      wctx.restore();

      traceFrontWavePath();
      wctx.lineWidth = 0.75;
      wctx.strokeStyle = palette.edgeSoft;
      wctx.stroke();

      t += 0.010;
      waveAnimId = requestAnimationFrame(drawWaveFrame);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(waveAnimId);
      } else {
        waveAnimId = requestAnimationFrame(drawWaveFrame);
      }
    });

    window.addEventListener('resize', function () {
      resizeWave();
    }, { passive: true });

    resizeWave();
    waveAnimId = requestAnimationFrame(drawWaveFrame);
  }


  /* ============================================================
     3. CURSOR GLOW — Desktop only
     Updates CSS variables --mouse-x / --mouse-y on <body>
     which power the ::after pseudo-element in animations.css
     ============================================================ */

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      document.body.style.setProperty('--mouse-x', e.clientX + 'px');
      document.body.style.setProperty('--mouse-y', e.clientY + 'px');
    }, { passive: true });
  }


  /* ============================================================
     4. INTERSECTION OBSERVER — Scroll Reveal
     Watches elements with class="reveal" or "reveal-group"
     and adds .is-visible when they enter the viewport.
     ============================================================ */

  const revealEls = document.querySelectorAll('.reveal, .reveal-group');

  if (revealEls.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve after first reveal for performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold : 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

/* =========================================================
   CODEMARGIN – animations.js
   Animation engine: intersection observer for scroll reveals
   ========================================================= */

(function () {
  'use strict';

  /* Reveal elements as they enter the viewport */
  const revealEls = document.querySelectorAll('.service-card, .strap-heading, .strap-desc, .strap-arrows');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => {
      el.classList.add('reveal-ready');
      io.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealEls.forEach(el => el.classList.add('in-view'));
  }

})();


(function initWaveAnimation() {

  // Prevent duplicate init (SPA navigation safety)
  if (window.__waveAnimationInit) return;
  window.__waveAnimationInit = true;

  const WAVE_PATH_A = [
    "M0,60",
    "C360,0 1080,120 1440,60",
    "L1440,120 L0,120 Z"
  ].join(" ");

  const WAVE_PATH_B = [
    "M0,60",
    "C360,120 1080,0 1440,60",
    "L1440,120 L0,120 Z"
  ].join(" ");

  function startWave() {
    const wave = document.querySelector("#wavePath");
    if (!wave) return;

   
    gsap.killTweensOf(wave);
 gsap.to(wave, {
      duration: 3.5,         // Premium breathing pace
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      attr: {
        d: WAVE_PATH_B
      },
      // Ensure GPU compositing (reduces layout thrash)
      force3D: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWave);
  } else {
   
    startWave();
  }

})(); 


