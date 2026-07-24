document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', false);
}));

// Header shadow on scroll
const siteHeader = document.querySelector('.site-header');
const onHeaderScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 12);
onHeaderScroll();
window.addEventListener('scroll', onHeaderScroll, { passive: true });

// Scroll-reveal animations
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

function observeReveals(root = document) {
  root.querySelectorAll('.reveal, .reveal-stagger').forEach(el => revealObserver.observe(el));
}
observeReveals();

// Count-up numbers (About stats)
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count-to]').forEach(el => countObserver.observe(el));

// Gallery
const INITIAL_COUNT = 12;
const grid = document.getElementById('gallery-grid');
let images = [];
let currentIndex = 0;

fetch('assets/gallery-manifest.json')
  .then(r => r.json())
  .then(list => {
    images = list;
    renderGallery(INITIAL_COUNT);
  })
  .catch(() => {
    grid.innerHTML = '<p style="color:#8a8776">Gallery photos coming soon.</p>';
  });

function renderGallery(count) {
  grid.innerHTML = '';
  const shown = images.slice(0, count);
  shown.forEach((name, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${Math.min(i, 16) * 0.04}s`;
    item.innerHTML = `<img src="assets/gallery/thumbs/${name}" alt="Door installed by Just Doors Northampton" loading="lazy">`;
    item.addEventListener('click', () => openLightbox(i));
    grid.appendChild(item);
  });

  const existingBtn = document.querySelector('.gallery-more');
  if (existingBtn) existingBtn.remove();

  if (count < images.length) {
    const btn = document.createElement('button');
    btn.className = 'gallery-more';
    btn.textContent = `Show More Photos (${images.length - count} more)`;
    btn.addEventListener('click', () => renderGallery(images.length));
    grid.insertAdjacentElement('afterend', btn);
  }
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(index) {
  currentIndex = index;
  updateLightboxImage();
  lightbox.classList.add('open');
}
function updateLightboxImage() {
  lightboxImg.src = `assets/gallery/${images[currentIndex]}`;
}
function closeLightbox() {
  lightbox.classList.remove('open');
}
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateLightboxImage();
});
document.getElementById('lightbox-next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % images.length;
  updateLightboxImage();
});
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
  if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
});
