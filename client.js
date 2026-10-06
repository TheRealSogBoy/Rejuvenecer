const navigation = document.querySelector('.navigation');
const desktop = window.matchMedia('(min-width: 1120px)');
function syncNavigation() { if (navigation) navigation.open = desktop.matches; }
syncNavigation();
desktop.addEventListener('change', syncNavigation);
if (navigation) {
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { if (!desktop.matches) navigation.open = false; }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !desktop.matches && navigation.open) { navigation.open = false; navigation.querySelector('summary')?.focus(); } });
  document.addEventListener('click', event => { if (!desktop.matches && !navigation.contains(event.target)) navigation.open = false; });
}

// Interactive Before / After comparison slider
document.querySelectorAll('.comparison input').forEach(input => {
  const comp = input.closest('.comparison');
  const update = () => comp.style.setProperty('--position', `${input.value}%`);
  input.addEventListener('input', update);
  input.addEventListener('change', update);
});

// Spaces Carousel Controller (Preserves natural aspect ratio & allows arrow / dot / swipe navigation)
const spacesCarousel = document.querySelector('.spaces-carousel');
if (spacesCarousel) {
  const slides = spacesCarousel.querySelectorAll('.spaces-slide');
  const prevBtn = spacesCarousel.querySelector('.carousel-arrow.prev');
  const nextBtn = spacesCarousel.querySelector('.carousel-arrow.next');
  const dots = spacesCarousel.querySelectorAll('.carousel-dot');
  const counter = spacesCarousel.querySelector('.carousel-counter');
  const caption = spacesCarousel.querySelector('.carousel-title');
  let currentIndex = 0;

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', !isActive);
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive);
    });

    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }

    if (caption && slides[currentIndex]) {
      const title = slides[currentIndex].getAttribute('data-title');
      if (title) caption.textContent = title;
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(idx)) showSlide(idx);
    });
  });

  // Touch swipe handling for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  spacesCarousel.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  spacesCarousel.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) showSlide(currentIndex + 1); // swipe left
      else showSlide(currentIndex - 1); // swipe right
    }
  }, { passive: true });

  // Keyboard navigation when focused
  spacesCarousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      showSlide(currentIndex - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      showSlide(currentIndex + 1);
      e.preventDefault();
    }
  });

  // Initialize first slide
  showSlide(0);
}

// Load Instagram official embed script lazily when near viewport
const instagramGrid = document.querySelector('.instagram-grid');
let instagramRequested = false;
function loadInstagram() {
  if (instagramRequested) return;
  instagramRequested = true;
  const script = document.createElement('script');
  script.src = 'https://www.instagram.com/embed.js';
  script.async = true;
  script.onload = () => window.instgrm?.Embeds?.process();
  script.onerror = () => document.querySelectorAll('.embed-status').forEach(el => {
    el.textContent = 'Puedes ver este caso directamente en Instagram.';
  });
  document.head.append(script);
}
if (instagramGrid) {
  const labelFrames = () => instagramGrid.querySelectorAll('.instagram-case').forEach(card => {
    const frame = card.querySelector('iframe');
    if (frame && !frame.title) frame.title = `Caso de Rejuvenecer: ${card.querySelector('h3')?.textContent || 'Tratamiento'}`;
  });
  new MutationObserver(labelFrames).observe(instagramGrid, { childList: true, subtree: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { loadInstagram(); observer.disconnect(); }
    }, { rootMargin: '350px' });
    observer.observe(instagramGrid);
  } else loadInstagram();
}

// --- Smooth Scroll Reveal System ---
(function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('has-animations');

  const targets = document.querySelectorAll(
    '.section-heading, .pillar-card, .treatment-card, .collection-header, ' +
    '.rhino-spotlight-copy, .rhino-list, .rhino-clinical-callout, .gallery-card, ' +
    '.instagram-case, .boutique-testimonial, .step-item, .doctor-frame, .doctor-copy, ' +
    '.spaces-carousel, .faq-box, .location-copy, .location-media, .valuation-box, .payments-strip'
  );

  document.querySelectorAll('.pillars-grid, .cards-grid, .gallery-grid, .reels-grid, .steps-grid, .faq-list').forEach(grid => {
    Array.from(grid.children).forEach((child, index) => {
      child.style.setProperty('--stagger-delay', `${(index % 4) * 90}ms`);
    });
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    targets.forEach(el => {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  } else {
    targets.forEach(el => el.classList.add('is-visible'));
  }
})();

