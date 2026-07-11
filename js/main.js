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

// цели Яндекс.Метрики: клик «Записаться» и переход в телеграм-канал
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('a');
  if (!a || typeof window.ym !== 'function') return;
  const href = a.getAttribute('href') || '';
  const text = (a.textContent || '').toLowerCase();
  if (href.indexOf('dikidi.net/2105960') !== -1 || text.indexOf('записаться') !== -1) {
    try { window.ym(110592816, 'reachGoal', 'zapis'); } catch (e) {}
  } else if (href.indexOf('t.me/ESVIum') !== -1) {
    try { window.ym(110592816, 'reachGoal', 'tg_channel'); } catch (e) {}
  }
});
