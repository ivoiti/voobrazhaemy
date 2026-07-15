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

// hero-видео (6 МБ): постер виден сразу, само видео грузим после первой отрисовки — иначе оно тормозит открытие
(() => {
  const hero = document.querySelector('.hero__video');
  if (!hero || !hero.dataset.src || hero.src) return;
  const load = () => {
    hero.src = hero.dataset.src;
    hero.play().catch(() => {});
  };
  const defer = () => (window.requestIdleCallback ? requestIdleCallback(load, { timeout: 2000 }) : setTimeout(load, 300));
  if (document.readyState === 'complete') defer();
  else window.addEventListener('load', defer, { once: true });
})();

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

// ВРЕМЕННЫЙ АНОНС «зеркальце»: выплывает после первого скролла, один раз на посетителя
(() => {
  const note = document.getElementById('mirrorNote');
  if (!note) return;

  let closed = false;
  try { closed = localStorage.getItem('mirrorNoteClosed') === '1'; } catch (e) {}
  if (closed) { note.remove(); return; }

  const open = () => {
    if (window.scrollY < 140) return;          // ждём первый скролл
    note.classList.add('is-open');
    window.removeEventListener('scroll', open);
  };
  window.addEventListener('scroll', open, { passive: true });

  note.querySelector('.mirror-note__close').addEventListener('click', () => {
    note.classList.remove('is-open');
    try { localStorage.setItem('mirrorNoteClosed', '1'); } catch (e) {}
    setTimeout(() => note.remove(), 500);
  });
})();

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
