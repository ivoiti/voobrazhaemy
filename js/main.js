// появление блоков при скролле
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// навигация меняет фон после hero
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.7);
}, { passive: true });

// ленивое видео в карточках граней: играет при наведении, грузится при появлении
const vio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const v = e.target;
      if (v.dataset.src && !v.src) v.src = v.dataset.src;
      vio.unobserve(v);
    }
  });
}, { rootMargin: '200px' });
document.querySelectorAll('.facet__media video').forEach((v) => {
  vio.observe(v);
  const card = v.closest('.facet');
  card.addEventListener('mouseenter', () => v.play().catch(() => {}));
  card.addEventListener('mouseleave', () => v.pause());
});
