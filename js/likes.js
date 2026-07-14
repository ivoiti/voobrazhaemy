/* Лайки со счётчиком для voobrazhaemy.ru.
   Любой элемент с атрибутом data-like="<slug>" становится кнопкой лайка.
   Внутри него: .like-heart (♡/♥) и .like-count (число).
   Счёт хранит Cloudflare Worker (общий для всех). Факт «я лайкнул» — в localStorage.
   Работает и на карточках-ссылках (клик по сердечку не открывает статью). */
(function () {
  "use strict";
  var API = "https://voobrazhaemy-likes.voobrazhaemy.workers.dev";

  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-like]"));
  if (!nodes.length) return;

  var uniq = [];
  nodes.forEach(function (n) {
    var s = n.getAttribute("data-like");
    if (uniq.indexOf(s) === -1) uniq.push(s);
  });

  function isLiked(slug) { return localStorage.getItem("liked:" + slug) === "1"; }
  function setLiked(slug, v) {
    if (v) localStorage.setItem("liked:" + slug, "1");
    else localStorage.removeItem("liked:" + slug);
  }

  function nodesFor(slug) {
    return nodes.filter(function (n) { return n.getAttribute("data-like") === slug; });
  }

  function renderHeart(node) {
    var slug = node.getAttribute("data-like");
    var liked = isLiked(slug);
    node.classList.toggle("is-liked", liked);
    node.setAttribute("aria-pressed", liked ? "true" : "false");
    var h = node.querySelector(".like-heart");
    if (h) h.textContent = liked ? "♥" : "♡"; // ♥ / ♡
  }

  function setCount(slug, n) {
    nodesFor(slug).forEach(function (node) {
      var c = node.querySelector(".like-count");
      if (c) c.textContent = (n == null ? "" : String(n));
    });
  }

  // начальная отрисовка сердец + загрузка чисел одним батч-запросом
  nodes.forEach(renderHeart);
  fetch(API + "/?slugs=" + encodeURIComponent(uniq.join(",")))
    .then(function (r) { return r.json(); })
    .then(function (counts) { uniq.forEach(function (s) { setCount(s, counts[s] || 0); }); })
    .catch(function () { /* сеть недоступна — оставляем сердечко без числа */ });

  nodes.forEach(function (node) {
    node.addEventListener("click", function (ev) {
      ev.preventDefault();   // не открывать статью, если сердечко внутри карточки-ссылки
      ev.stopPropagation();
      var slug = node.getAttribute("data-like");
      var was = isLiked(slug);
      var delta = was ? -1 : 1;

      // оптимистично: переключаем состояние и число
      setLiked(slug, !was);
      nodesFor(slug).forEach(renderHeart);
      var c = node.querySelector(".like-count");
      var cur = c ? (parseInt(c.textContent, 10) || 0) : 0;
      setCount(slug, Math.max(0, cur + delta));

      // цель в Яндекс.Метрику (только при постановке лайка)
      if (!was) { try { if (window.ym) ym(110592816, "reachGoal", "like_dver"); } catch (e) {} }

      fetch(API + "/?slug=" + encodeURIComponent(slug) + "&delta=" + delta, { method: "POST" })
        .then(function (r) { return r.json(); })
        .then(function (res) { if (res && typeof res.count === "number") setCount(slug, res.count); })
        .catch(function () {
          // откат при ошибке сети
          setLiked(slug, was);
          nodesFor(slug).forEach(renderHeart);
          setCount(slug, cur);
        });
    });
  });
})();
