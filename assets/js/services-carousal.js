(function () {
  const cardsData = [
    {
      imgSrc: "assets/images/app.jpg",
      alt: "App Development",
      pill: "MOBILE",
      title: "App<br/>Development",
      desc: "We create powerful mobile apps that enhance engagement and accelerate growth.",
      iconPlaceholder: "📱"
    },
    {
      imgSrc: "assets/images/cloud.jpg",
      alt: "Cloud Computing",
      pill: "CLOUD",
      title: "Cloud<br/>Computing",
      desc: "We deliver scalable cloud solutions that optimize performance on the cloud.",
      iconPlaceholder: "☁️"
    },
    {
      imgSrc: "assets/images/AI.jpg",
      alt: "AI Solutions",
      pill: "AI",
      title: "AI",
      desc: "We build smart AI solutions that automate tasks and enhance decision-making.",
      iconPlaceholder: "🤖"
    },
    {
      imgSrc: "assets/images/redhat.jpg",
      alt: "Red Hat Consultancy",
      pill: "RED HAT",
      title: "Red Hat<br/>Consultancy",
      desc: "We help businesses deploy, optimize, as well as secure their Red Hat environments.",
      iconPlaceholder: "🖥️"
    },
    {
      imgSrc: "assets/images/data.jpg",
      alt: "Data and Analytics",
      pill: "ANALYTICS",
      title: "Data and<br/>analytics",
      desc: "We turn your data into meaningful insights for smarter decisions for your business.",
      iconPlaceholder: "📊"
    },
    {
      imgSrc: "assets/images/web.jpg",
      alt: "Web Development",
      pill: "WEB",
      title: "Web<br/>Development",
      desc: "We craft modern web experiences that drive impact and deliver seamless experiences.",
      iconPlaceholder: "🌐"
    }
  ];

  function createCard(cardInfo) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'service-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'card-image-wrap';
    const img = document.createElement('img');
    img.className = 'card-img';
    img.src = cardInfo.imgSrc;
    img.alt = cardInfo.alt;
    img.loading = 'lazy';
    img.onerror = function () {
      const placeholderDiv = this.nextElementSibling;
      if (placeholderDiv) placeholderDiv.style.opacity = '1';
      this.style.display = 'none';
    };
    const placeholderDiv = document.createElement('div');
    placeholderDiv.className = 'card-img-placeholder';
    const placeholderSpan = document.createElement('span');
    placeholderSpan.className = 'placeholder-icon';
    placeholderSpan.textContent = cardInfo.iconPlaceholder;
    placeholderDiv.appendChild(placeholderSpan);
    const pillSpan = document.createElement('span');
    pillSpan.className = 'card-pill';
    pillSpan.textContent = cardInfo.pill;
    imageWrap.appendChild(img);
    imageWrap.appendChild(placeholderDiv);
    imageWrap.appendChild(pillSpan);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.innerHTML = cardInfo.title;
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = cardInfo.desc;

    const exploreDiv = document.createElement('div');
    exploreDiv.className = 'card-explore';
    const exploreText = document.createElement('span');
    exploreText.className = 'explore-text';
    exploreText.textContent = 'EXPLORE SERVICES';
    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'explore-arrow-svg';
    arrowSpan.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    exploreDiv.appendChild(exploreText);
    exploreDiv.appendChild(arrowSpan);

    cardBody.appendChild(title);
    cardBody.appendChild(desc);
    cardBody.appendChild(exploreDiv);

    cardDiv.appendChild(imageWrap);
    cardDiv.appendChild(cardBody);
    return cardDiv;
  }

  const track = document.getElementById('infiniteTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const carouselContainer = document.querySelector('.carousel-container');

  let originalCards = cardsData.map(data => createCard(data));
  const originalCardCount = originalCards.length;
  const visibleCards = 3;
  let currentIndex = 0;
  let allCards = [];
  let isTransitioning = false;
  let pauseAuto = false;
  let autoTimer = null;

  function buildInfiniteTrack() {
    const originals = originalCards.map(card => card.cloneNode(true));
    const lastClones = originals.slice(-visibleCards).map(card => card.cloneNode(true));
    const firstClones = originals.slice(0, visibleCards).map(card => card.cloneNode(true));
    allCards = [...lastClones, ...originals, ...firstClones];
    track.innerHTML = '';
    allCards.forEach(card => track.appendChild(card));
    currentIndex = visibleCards;
    updateTransform(false);
  }

  function getCardWidth() {
    if (!track.children.length) return 300;
    const firstCard = track.children[0];
    const width = firstCard.getBoundingClientRect().width;
    const gap = parseInt(window.getComputedStyle(track).gap) || 24;
    return width + gap;
  }

  function updateTransform(transitionEnabled = true) {
    if (isTransitioning && !transitionEnabled) return;
    const step = getCardWidth();
    const offset = -(currentIndex * step);
    track.style.transition = transitionEnabled
      ? 'transform 0.45s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
      : 'none';
    track.style.transform = `translateX(${offset}px)`;
  }

  function handleTransitionEnd() {
    if (!track.style.transform) return;
    isTransitioning = false;
    const cloneOffsetStart = visibleCards;
    const cloneOffsetEnd = cloneOffsetStart + originalCardCount - 1;

    if (currentIndex > cloneOffsetEnd) {
      const newIndex = cloneOffsetStart + (currentIndex - cloneOffsetEnd - 1);
      if (newIndex <= cloneOffsetEnd) {
        currentIndex = newIndex;
        updateTransform(false);
      }
    } else if (currentIndex < cloneOffsetStart) {
      const jumpedIndex = cloneOffsetEnd - (cloneOffsetStart - currentIndex) + 1;
      if (jumpedIndex >= cloneOffsetStart) {
        currentIndex = jumpedIndex;
        updateTransform(false);
      }
    }

    restartAutoSlide();
  }

  function slideNext() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateTransform(true);
    resetAutoTimer();
  }

  function slidePrev() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateTransform(true);
    resetAutoTimer();
  }

  function startAutoSlide() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!pauseAuto && !isTransitioning) {
        slideNext();
      }
    }, 3200);
  }

  function resetAutoTimer() {
    if (!pauseAuto) {
      if (autoTimer) clearInterval(autoTimer);
      startAutoSlide();
    }
  }

  function restartAutoSlide() {
    if (!pauseAuto) {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
      startAutoSlide();
    }
  }

  function pauseCarouselAuto() {
    pauseAuto = true;
    if (autoTimer) clearInterval(autoTimer);
  }

  function resumeCarouselAuto() {
    pauseAuto = false;
    if (!isTransitioning) {
      startAutoSlide();
    }
  }

  let resizeTimeout;
  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!isTransitioning) {
        updateTransform(false);
      } else {
        setTimeout(() => updateTransform(false), 50);
      }
    }, 100);
  }

  track.addEventListener('transitionend', handleTransitionEnd);

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isTransitioning) return;
    slidePrev();
    pauseCarouselAuto();
    setTimeout(() => {
      if (!pauseAuto) return;
      resumeCarouselAuto();
    }, 3000);
  });

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isTransitioning) return;
    slideNext();
    pauseCarouselAuto();
    setTimeout(() => {
      if (!pauseAuto) return;
      resumeCarouselAuto();
    }, 3000);
  });

  carouselContainer.addEventListener('mouseenter', () => {
    pauseCarouselAuto();
  });
  carouselContainer.addEventListener('mouseleave', () => {
    if (!isTransitioning) {
      resumeCarouselAuto();
    } else {
      const onEndResume = () => {
        resumeCarouselAuto();
        track.removeEventListener('transitionend', onEndResume);
      };
      track.addEventListener('transitionend', onEndResume);
    }
  });

  function initCarousel() {
    buildInfiniteTrack();
    setTimeout(() => {
      updateTransform(false);
      startAutoSlide();
    }, 20);
    window.addEventListener('resize', handleResize);
  }

  // Drag support
  let startX = 0;
  let isDragging = false;
  const dragThreshold = 30;
  track.addEventListener('mousedown', (e) => {
    if (isTransitioning) return;
    startX = e.clientX;
    isDragging = true;
    track.style.cursor = 'grabbing';
    pauseCarouselAuto();
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
  });
  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    const diff = e.clientX - startX;
    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0) slidePrev();
      else slideNext();
    }
    setTimeout(() => {
      if (!pauseAuto) resumeCarouselAuto();
    }, 2000);
  });
  track.addEventListener('dragstart', (e) => e.preventDefault());

  initCarousel();
})();


// === CUSTOM CURSOR (only on service cards) ===
(function customCursorInit() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  const carouselCards = () => document.querySelectorAll('.service-card');
  let active = false;

  const onMouseMove = (e) => {
    if (!active) return;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  };

  const onCardEnter = () => {
    active = true;
    cursor.classList.add('visible');
    document.addEventListener('mousemove', onMouseMove);
  };

  const onCardLeave = () => {
    active = false;
    cursor.classList.remove('visible');
    document.removeEventListener('mousemove', onMouseMove);
  };

  function bindEventsToCards() {
    const cards = carouselCards();
    cards.forEach(card => {
      card.removeEventListener('mouseenter', onCardEnter);
      card.removeEventListener('mouseleave', onCardLeave);
      card.addEventListener('mouseenter', onCardEnter);
      card.addEventListener('mouseleave', onCardLeave);
    });
  }

  bindEventsToCards();

  const track = document.getElementById('infiniteTrack');
  if (track) {
    const observer = new MutationObserver(() => bindEventsToCards());
    observer.observe(track, { childList: true, subtree: false });
  }

  window.addEventListener('resize', () => bindEventsToCards());

  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseleave', () => {
      if (active) onCardLeave();
    });
  }
})();