// Считаем переход к оплате, а не успешный платеж: его принимает AI4G / PayKeeper.
document.addEventListener('click', function (event) {
  const link = event.target.closest('a[data-payment]');
  if (!link || typeof window.ym !== 'function') return;
  try {
    window.ym(110592816, 'reachGoal', 'payment_' + link.dataset.payment, {
      placement: link.dataset.placement
    });
  } catch (_) {}
});
