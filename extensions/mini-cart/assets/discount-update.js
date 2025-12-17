document.addEventListener('click', async (e) => {
  if (e.target.id === 'mini-cart-discount-apply') {
    const code = document.getElementById('mini-cart-discount-input')?.value.trim();
    if (!code) return;

    const returnUrl = window.location.pathname + window.location.search;

    try {
      await fetch(`/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(returnUrl)}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Accept': 'text/html' }
      });

      if (window.MiniCart && window.MiniCart.refresh) window.MiniCart.refresh();
    } catch (err) {
      alert('Failed to apply discount.');
    }
  }
});
document.addEventListener('click', async (e) => {
  if (e.target.id === 'mini-cart-remove-discount') {

    await fetch('/cart/update.js', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attributes: { coupon: null, coupon_type: null, coupon_value: null } })
    });

    window.MiniCart.refresh();
  }
});