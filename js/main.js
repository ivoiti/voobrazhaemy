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
  if (href.indexOf('zapis.html') !== -1 || text.indexOf('записаться') !== -1 || text.indexOf('оставить заявку') !== -1) {
    try { window.ym(110592816, 'reachGoal', 'zapis'); } catch (e) {}
  } else if (href.indexOf('t.me/ESVIum') !== -1) {
    try { window.ym(110592816, 'reachGoal', 'tg_channel'); } catch (e) {}
  }
});

/* гамбургер-меню (общее) */
(function(){
  var b=document.getElementById('burger'), m=document.getElementById('menu'), c=document.getElementById('menuClose');
  if(!b||!m) return;
  function openM(){ m.classList.add('is-open'); document.body.classList.add('menu-open'); m.setAttribute('aria-hidden','false'); }
  function closeM(){ m.classList.remove('is-open'); document.body.classList.remove('menu-open'); m.setAttribute('aria-hidden','true'); }
  b.addEventListener('click', openM);
  if(c) c.addEventListener('click', closeM);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeM(); });
})();

/* Карусель отзывов: листание стрелками/точками/свайпом + «Читать полностью» */
(function(){
  var root = document.getElementById('revCarousel');
  if (!root) return;
  var track = root.querySelector('.rev-track');
  var slides = [].slice.call(root.querySelectorAll('.rev-slide'));
  var dotsWrap = document.getElementById('revDots');
  var prev = root.querySelector('.rev-prev');
  var next = root.querySelector('.rev-next');
  if (!track || !slides.length) return;
  var idx = 0;

  // длинные отзывы сворачиваем и добавляем кнопку.
  // Замер делаем после загрузки шрифтов — иначе высота считается по системному шрифту и врёт.
  function setupClamp(){
    var LIMIT = 232;   // должно совпадать с max-height у .rev-text.is-clamped
    slides.forEach(function(slide){
      var text = slide.querySelector('.rev-text');
      if (!text || text.dataset.clampReady) return;
      text.dataset.clampReady = '1';
      var full = text.scrollHeight;                  // высота без ограничения
      if (full <= LIMIT + 8) return;                 // помещается целиком — ничего не делаем
      text.classList.add('is-clamped');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rev-more';
      btn.textContent = 'Читать полностью';
      btn.setAttribute('aria-expanded', 'false');
      text.insertAdjacentElement('afterend', btn);
      btn.addEventListener('click', function(){
        var collapsed = text.classList.toggle('is-clamped');
        btn.textContent = collapsed ? 'Читать полностью' : 'Свернуть';
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });
    });
  }
  function resetClamp(){
    slides.forEach(function(slide){
      var text = slide.querySelector('.rev-text');
      if (!text) return;
      delete text.dataset.clampReady;
      text.classList.remove('is-clamped');
      var old = slide.querySelector('.rev-more');
      if (old) old.remove();
    });
    setupClamp();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setupClamp);
  } else {
    window.addEventListener('load', setupClamp);
  }
  // при смене ширины (поворот телефона) число строк меняется — пересчитываем
  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(resetClamp, 250);
  });

  // точки
  slides.forEach(function(_, i){
    var d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    d.addEventListener('click', function(){ go(i); });
    dotsWrap.appendChild(d);
  });

  function go(i){
    idx = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-idx * 100) + '%)';
    [].slice.call(dotsWrap.children).forEach(function(d, n){
      d.classList.toggle('active', n === idx);
    });
  }
  if (prev) prev.addEventListener('click', function(){ go(idx - 1); });
  if (next) next.addEventListener('click', function(){ go(idx + 1); });

  // свайп на телефоне
  var x0 = null;
  root.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive: true});
  root.addEventListener('touchend', function(e){
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) go(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  }, {passive: true});

  go(0);
})();
