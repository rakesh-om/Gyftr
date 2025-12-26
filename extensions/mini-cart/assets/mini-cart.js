/* Mini Cart App — universal drawer that suppresses theme carts and redirects */

/* ---------- HARD-KILL COMMON THEME CARTS ---------- */
try {
    window.Shopify = window.Shopify || {};
    window.Shopify.theme = window.Shopify.theme || {};
    window.Shopify.theme.CartDrawer = null;
    window.Shopify.theme.Cart = null;
    window.Shopify.theme.CartNote = null;
    window.Shopify.theme.CartNotification = null;
} catch {}

try {
    window.Horizon = window.Horizon || {};
    window.Horizon.AjaxCart = () => null;
} catch {}
try {
    window.Theme = window.Theme || {};
    window.Theme.AjaxCart = () => null;
} catch {}
try {
    window.Prestige = window.Prestige || {};
    window.Prestige.Cart = () => null;
} catch {}
try {
    window.Timber = window.Timber || {};
    window.Timber.AjaxCart = () => null;
} catch {}
try {
    window.theme = window.theme || {};
    window.theme.CartDrawer = null;
} catch {}

function lockProp(obj, key) {
    try {
        Object.defineProperty(obj, key, {
            configurable: false,
            enumerable: true,
            get() {
                return null;
            },
            set() {}
        });
    } catch {}
}
try {
    lockProp(window.Shopify.theme, 'CartDrawer');
    lockProp(window.Shopify.theme, 'CartNotification');
} catch {}
try {
    lockProp(window, 'ajaxCart');
} catch {}

/* ---------- MINI CART IMPLEMENTATION ---------- */
(() => {
    const cfg = window.__MINICART_CONFIG__ || {};
    const currency =
        (window.Shopify && Shopify.currency && Shopify.currency.active) ||
        document.documentElement.getAttribute('data-shop-currency') ||
        'USD';

    const root = document.getElementById('mini-cart-root');
    const itemsEl = document.getElementById('mini-cart-items');
    const subtotalEl = document.getElementById('mini-cart-subtotal-amount');
    const countEl = document.getElementById('mini-cart-count');

    if (!root || !itemsEl) return;

    function fmt(cents) {
        try {
            return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency
                })
                .format((Number(cents) || 0) / 100);
        } catch {
            const n = (Number(cents) || 0) / 100;
            return `₹${n.toFixed(2)}`;
        }
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        } [m]));
    }

    const open = () => {
        root.hidden = false;
        void root.offsetHeight;
        root.classList.add('open');
        loadCart();
    };

    const close = () => {
        root.classList.remove('open');
        setTimeout(() => root.hidden = true, 250);
    };

    root.addEventListener('click', (e) => {
        if (e.target.matches('[data-mini-cart-close], .mini-cart-overlay')) close();
    });

    if (cfg.triggerSelector) {
        try {
            const t = document.querySelector(cfg.triggerSelector);
            if (t) t.setAttribute('data-cart-toggle', 'true');
        } catch {}
    }

    const floatingTrigger = document.getElementById('mini-cart-floating-trigger');
    if (floatingTrigger) floatingTrigger.addEventListener('click', open);

    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-cart-toggle]');
        if (!el) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        open();
    }, true);

    function updateBadge(cart) {
        if (!countEl) return;
        const n = Number(cart.item_count || 0);
        countEl.textContent = n;
        if (n > 0) countEl.classList.remove('mini-cart-badge--invisible');
    }

    function updateFreeShipping(cart) {
        const threshold = Number(cfg.freeShippingThresholdCents || 0);
        if (!threshold) return;

        const subtotal = Number(cart.items_subtotal_price || 0);
        const textEl = document.getElementById('mini-cart-free-text');
        const bar = document.getElementById('mini-cart-progress-bar');
        if (!textEl || !bar) return;

        if (subtotal >= threshold) {
            textEl.textContent = '✅ You unlocked FREE Shipping!';
            bar.style.width = '100%';
            bar.classList.add('unlocked');
        } else {
            const diff = Math.max(threshold - subtotal, 0);
            textEl.textContent = `Add ${fmt(diff)} more to get FREE Shipping`;
            bar.style.width = `${Math.max(2, (subtotal / threshold) * 100)}%`;
            bar.classList.remove('unlocked');
        }
    }

    async function loadCart() {
        const cart = await fetch('/cart.js', {
            credentials: 'same-origin'
        }).then(r => r.json());
        if (subtotalEl) subtotalEl.textContent = fmt(cart.total_price);

        const footer = document.querySelector('.mini-cart-footer');
        let existing = footer.querySelector('.mini-cart-discount-summary');
        if (existing) existing.remove();

        if (cart.cart_level_discount_applications.length > 0) {
            const d = cart.cart_level_discount_applications[0];
            const box = document.createElement('div');
            box.className = 'mini-cart-discount-summary';
            box.innerHTML = `
      <button id="mini-cart-remove-discount" title="Remove ${d.title} Discount" class="mini-cart-remove-discount">${d.title} <span>×</span> </button>
        <div class="mini-cart-discount-line">
          <span class="discount-tag">${d.title}</span>
          <strong>-${fmt(d.total_allocated_amount)}</strong>
        </div>
        
      `;
            footer.insertBefore(box, footer.querySelector('.mini-cart-subtotal'));
        }

        updateBadge(cart);
        updateFreeShipping(cart);

        if (!cart.items.length) {
            itemsEl.innerHTML = `<p class="mini-cart-empty">Your cart is empty.</p>`;
            return;
        }

        itemsEl.innerHTML = cart.items.map((item, i) => `
      <div class="mini-cart-item" data-line="${i + 1}">
        <img src="${item.image}" alt="">
        <div class="mini-cart-details">
          <strong>${escapeHtml(item.product_title)}${item.variant_title ? ` • ${escapeHtml(item.variant_title)}` : ''}</strong>
          <div class="mini-cart-qty">
            <button type="button" data-qty-dec aria-label="Decrease">−</button>
            <input type="number" value="${item.quantity}" min="1" inputmode="numeric" aria-label="Quantity">
            <button type="button" data-qty-inc aria-label="Increase">+</button>
          </div>
        </div>
        <div class="mini-cart-price">${fmt(item.final_line_price)}</div>
        <button type="button" class="mini-cart-remove" data-remove aria-label="Remove">×</button>
      </div>
    `).join('');

        bindQtyControls();
    }

    function bindQtyControls() {
        itemsEl.querySelectorAll('.mini-cart-item').forEach(el => {
            const line = Number(el.dataset.line);
            const input = el.querySelector('input');

            el.querySelector('[data-qty-inc]').onclick = () => updateQty(line, Number(input.value || 1) + 1);
            el.querySelector('[data-qty-dec]').onclick = () => updateQty(line, Math.max(1, Number(input.value || 1) - 1));
            el.querySelector('[data-remove]').onclick = () => updateQty(line, 0);

            input.addEventListener('change', () => updateQty(line, Math.max(1, Number(input.value) || 1)));
        });
    }

    // async function updateQty(line, quantity) {
    //   await fetch('/cart/change.js', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'same-origin',
    //     body: JSON.stringify({ line, quantity })
    //   });
    //   await loadCart();
    // }
    async function updateQty(line, quantity) {
        // Show spinner overlay before updating
        const spinner = document.createElement('div');
        spinner.className = 'mini-cart-loading';
        spinner.innerHTML = `<div class="mini-cart-spinner"></div>`;
        document.getElementById('mini-cart-items').appendChild(spinner);

        try {
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    line,
                    quantity
                })
            });
            await loadCart();
        } catch (err) {
            console.error('Error updating cart:', err);
        } finally {
            // Remove spinner after cart refresh
            spinner.remove();
        }
    }

    /* -------- UNIVERSAL ADD-TO-CART INTERCEPTORS -------- */
    document.addEventListener('submit', async (e) => {
        const form = e.target;
        if (!form || !form.matches('form[action*="/cart/add"]')) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();

        const fd = new FormData(form);
        const id = fd.get('id');
        const qty = Number(fd.get('quantity') || 1);

        await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                id,
                quantity: qty
            })
        });

        if (cfg.enableAutoOpenOnAdd !== false) open();
        else loadCart();
    }, true);

    /* -------- DISCOUNT APPLY HANDLER -------- */
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'mini-cart-discount-apply') {
            e.preventDefault();
            const code = document.getElementById('mini-cart-discount-input')?.value.trim();
            if (!code) return alert('Please enter a discount code.');
            const returnUrl = window.location.pathname + window.location.search;
            const statusEl = document.getElementById('mini-cart-discount-status');
            if (statusEl) statusEl.textContent = 'Applying discount...';
            try {
                await fetch(`/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(returnUrl)}`, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'text/html'
                    }
                });
                await new Promise(r => setTimeout(r, 1000));
                await window.MiniCart.refresh();
                if (statusEl) statusEl.textContent = `Discount "${code}" applied successfully!`;
            } catch (err) {
                console.error('🚨 Error applying discount:', err);
                if (statusEl) statusEl.textContent = 'Error applying discount.';
            }
        }
    });

    /* -------- DISCOUNT REMOVE HANDLER (POLLING) -------- */


    document.addEventListener('click', async (e) => {

        if (e.target.id !== 'mini-cart-remove-discount') return;
        e.preventDefault();

        const statusEl = document.getElementById('mini-cart-discount-status');
        if (statusEl) statusEl.textContent = 'Removing discount...';

        try {
            await fetch('/discount/none', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'text/html'
                }
            });

            // Poll /cart.js until discounts clear
            const maxAttempts = 12;
            const delayMs = 300;
            let attempt = 0,
                cart = null;

            while (attempt < maxAttempts) {
                await new Promise(r => setTimeout(r, delayMs));
                attempt++;
                const res = await fetch('/cart.js', {
                    credentials: 'same-origin'
                });
                cart = await res.json();
                if (!cart.cart_level_discount_applications || cart.cart_level_discount_applications.length === 0) break;
            }

            if (cart) {
                const summary = document.querySelector('.mini-cart-discount-summary');
                if (summary) summary.remove();
                const subtotalEl = document.getElementById('mini-cart-subtotal-amount');
                if (subtotalEl) subtotalEl.textContent = fmt(cart.total_price);
                const input = document.getElementById('mini-cart-discount-input');
                if (input) input.value = '';
                if (statusEl) statusEl.textContent = 'Discount removed successfully.';
                if (window.MiniCart && window.MiniCart.refresh) await window.MiniCart.refresh();
                return;
            }

            if (statusEl) statusEl.textContent = 'Discount removed (timed out checking).';
            const summary = document.querySelector('.mini-cart-discount-summary');
            if (summary) summary.remove();
            if (window.MiniCart && window.MiniCart.refresh) await window.MiniCart.refresh();

        } catch (err) {
            console.error('🚨 Failed to remove discount:', err);
            if (statusEl) statusEl.textContent = 'Error removing discount.';
        }
    });

    window.MiniCart = {
        open,
        close,
        refresh: loadCart
    };
    loadCart();
})();

/* ---------- THEME CART OVERRIDE ---------- */
(function() {
    const cartButton = document.querySelector('cart-drawer-component > button');
    if (!cartButton) return;
    const cloned = cartButton.cloneNode(true);
    cartButton.parentNode.replaceChild(cloned, cartButton);
    cloned.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        if (window.MiniCart && window.MiniCart.open) window.MiniCart.open();
    }, true);
    const drawer = document.querySelector('cart-drawer-component');
    if (drawer) drawer.style.display = 'none';
})();




/* Mini Cart App — universal drawer that suppresses theme carts and redirects */

/* ---------- HARD-KILL COMMON THEME CARTS ---------- */
try {
    window.Shopify = window.Shopify || {};
    window.Shopify.theme = window.Shopify.theme || {};
    window.Shopify.theme.CartDrawer = null;
    window.Shopify.theme.Cart = null;
    window.Shopify.theme.CartNote = null;
    window.Shopify.theme.CartNotification = null;
} catch {}

try {
    window.Horizon = window.Horizon || {};
    window.Horizon.AjaxCart = () => null;
} catch {}
try {
    window.Theme = window.Theme || {};
    window.Theme.AjaxCart = () => null;
} catch {}
try {
    window.Prestige = window.Prestige || {};
    window.Prestige.Cart = () => null;
} catch {}
try {
    window.Timber = window.Timber || {};
    window.Timber.AjaxCart = () => null;
} catch {}
try {
    window.theme = window.theme || {};
    window.theme.CartDrawer = null;
} catch {}

function lockProp(obj, key) {
    try {
        Object.defineProperty(obj, key, {
            configurable: false,
            enumerable: true,
            get() {
                return null;
            },
            set() {}
        });
    } catch {}
}
try {
    lockProp(window.Shopify.theme, 'CartDrawer');
    lockProp(window.Shopify.theme, 'CartNotification');
} catch {}
try {
    lockProp(window, 'ajaxCart');
} catch {}

/* ---------- MINI CART IMPLEMENTATION ---------- */
(() => {
    const cfg = window.__MINICART_CONFIG__ || {};
    const currency =
        (window.Shopify && Shopify.currency && Shopify.currency.active) ||
        document.documentElement.getAttribute('data-shop-currency') ||
        'USD';

    const root = document.getElementById('mini-cart-root');
    const itemsEl = document.getElementById('mini-cart-items');
    const subtotalEl = document.getElementById('mini-cart-subtotal-amount');
    const countEl = document.getElementById('mini-cart-count');

    if (!root || !itemsEl) return;

    function fmt(cents) {
        try {
            return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency
                })
                .format((Number(cents) || 0) / 100);
        } catch {
            const n = (Number(cents) || 0) / 100;
            return `₹${n.toFixed(2)}`;
        }
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        } [m]));
    }

    const open = () => {
        root.hidden = false;
        void root.offsetHeight;
        root.classList.add('open');
        loadCart();
    };

    const close = () => {
        root.classList.remove('open');
        setTimeout(() => root.hidden = true, 250);
    };

    root.addEventListener('click', (e) => {
        if (e.target.matches('[data-mini-cart-close], .mini-cart-overlay')) close();
    });

    if (cfg.triggerSelector) {
        try {
            const t = document.querySelector(cfg.triggerSelector);
            if (t) t.setAttribute('data-cart-toggle', 'true');
        } catch {}
    }

    const floatingTrigger = document.getElementById('mini-cart-floating-trigger');
    if (floatingTrigger) floatingTrigger.addEventListener('click', open);

    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-cart-toggle]');
        if (!el) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        open();
    }, true);

    function updateBadge(cart) {
        if (!countEl) return;
        const n = Number(cart.item_count || 0);
        countEl.textContent = n;
        if (n > 0) countEl.classList.remove('mini-cart-badge--invisible');
    }

    function updateFreeShipping(cart) {
        const threshold = Number(cfg.freeShippingThresholdCents || 0);
        if (!threshold) return;

        const subtotal = Number(cart.items_subtotal_price || 0);
        const textEl = document.getElementById('mini-cart-free-text');
        const bar = document.getElementById('mini-cart-progress-bar');
        if (!textEl || !bar) return;

        if (subtotal >= threshold) {
            textEl.textContent = '✅ You unlocked FREE Shipping!';
            bar.style.width = '100%';
            bar.classList.add('unlocked');
        } else {
            const diff = Math.max(threshold - subtotal, 0);
            textEl.textContent = `Add ${fmt(diff)} more to get FREE Shipping`;
            bar.style.width = `${Math.max(2, (subtotal / threshold) * 100)}%`;
            bar.classList.remove('unlocked');
        }
    }

    async function loadCart() {
        const cart = await fetch('/cart.js', {
            credentials: 'same-origin'
        }).then(r => r.json());
        if (subtotalEl) subtotalEl.textContent = fmt(cart.total_price);

        // Display Gyftr redemption info if available
        // displayGyftrRedemption(cart);
        const footer = document.querySelector('.mini-cart-footer');
        let existing = footer.querySelector('.mini-cart-discount-summary');
        if (existing) existing.remove();

        if (cart.cart_level_discount_applications.length > 0) {
            const d = cart.cart_level_discount_applications[0];
            const box = document.createElement('div');
            box.className = 'mini-cart-discount-summary';
            box.innerHTML = `
      <button id="mini-cart-remove-discount" title="Remove ${d.title} Discount" class="mini-cart-remove-discount">${d.title} <span>×</span> </button>
        <div class="mini-cart-discount-line">
          <span class="discount-tag">${d.title}</span>
          <strong>-${fmt(d.total_allocated_amount)}</strong>
        </div>
        
      `;
            footer.insertBefore(box, footer.querySelector('.mini-cart-subtotal'));
        }

        updateBadge(cart);
        updateFreeShipping(cart);

        if (!cart.items.length) {
            itemsEl.innerHTML = `<p class="mini-cart-empty">Your cart is empty.</p>`;
            return;
        }

        itemsEl.innerHTML = cart.items.map((item, i) => `
      <div class="mini-cart-item" data-line="${i + 1}">
        <img src="${item.image}" alt="">
        <div class="mini-cart-details">
          <strong>${escapeHtml(item.product_title)}${item.variant_title ? ` • ${escapeHtml(item.variant_title)}` : ''}</strong>
          <div class="mini-cart-qty">
            <button type="button" data-qty-dec aria-label="Decrease">−</button>
            <input type="number" value="${item.quantity}" min="1" inputmode="numeric" aria-label="Quantity">
            <button type="button" data-qty-inc aria-label="Increase">+</button>
          </div>
        </div>
        <div class="mini-cart-price">${fmt(item.final_line_price)}</div>
        <button type="button" class="mini-cart-remove" data-remove aria-label="Remove">×</button>
      </div>
    `).join('');

        bindQtyControls();
    }


//           function displayGyftrRedemption(cart) {
//         console.log("Displaying Gyftr redemption info:", cart);
//         const displayBox = document.getElementById('gyftr-redemption-display');
//         const mroEl = document.getElementById('gyftr-mro-display');
//         const amountEl = document.getElementById('gyftr-amount-display');
//         const mobileEl = document.getElementById('gyftr-mobile-display');
//         const paybygifterbutton = document.getElementById('gyftr-pay-btn');
//         console.log("paybygifterbutton", paybygifterbutton);
        
        
//         if (!displayBox || !cart.attributes) return;

//         // 👇 FIX: Use the correct attribute keys
//             const mroNumber = cart.attributes.GyFTR_code;
//     const amount = cart.attributes.GyFTR_amount;
//   const mobile = cart.attributes.GyFTR_mobile;

//         console.log('MRO:', mroNumber, 'Amount:', amount, 'Mobile:', mobile); // Debug log

//         if (mroNumber && amount) {

//             console.log("Showing Gyftr redemption info");
//             displayBox.style.display = 'block';
//              paybygifterbutton.style.display = 'none';
//             mroEl.textContent = mroNumber;
//             amountEl.textContent = `₹${amount}`;
//             mobileEl.textContent = mobile ? `+91 ${mobile}` : '—';
//         } else {
//             displayBox.style.display = 'none';
//         }
//     }

// function displayGyftrRedemption(cart) {
//     const displayBox = document.getElementById('gyftr-redemption-display');
//     const mroEl = document.getElementById('gyftr-mro-display');
//     const amountEl = document.getElementById('gyftr-amount-display');
//     const mobileEl = document.getElementById('gyftr-mobile-display');
//     const paybygifterbutton = document.getElementById('gyftr-pay-btn');

//     if (!displayBox || !cart.attributes) return;

//     const mroNumber = cart.attributes.gyftr_code;
//     const amount = cart.attributes.gyftr_amount;
//     const mobile = cart.attributes.gyftr_mobile;

//     if (mroNumber && amount) {
//         displayBox.style.display = 'block';
//         if (paybygifterbutton) paybygifterbutton.style.display = 'none';
//         mroEl.textContent = mroNumber;
//         amountEl.textContent = `₹${amount}`;
//         mobileEl.textContent = mobile ? `+91 ${mobile}` : '—';
//     } else {
//         displayBox.style.display = 'none';
//         if (paybygifterbutton) paybygifterbutton.style.display = 'block'; // <-- ADD THIS LINE
//     }
// }
    
    function bindQtyControls() {
        itemsEl.querySelectorAll('.mini-cart-item').forEach(el => {
            const line = Number(el.dataset.line);
            const input = el.querySelector('input');

            el.querySelector('[data-qty-inc]').onclick = () => updateQty(line, Number(input.value || 1) + 1);
            el.querySelector('[data-qty-dec]').onclick = () => updateQty(line, Math.max(1, Number(input.value || 1) - 1));
            el.querySelector('[data-remove]').onclick = () => updateQty(line, 0);

            input.addEventListener('change', () => updateQty(line, Math.max(1, Number(input.value) || 1)));
        });
    }

    // async function updateQty(line, quantity) {
    //   await fetch('/cart/change.js', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'same-origin',
    //     body: JSON.stringify({ line, quantity })
    //   });
    //   await loadCart();
    // }
    async function updateQty(line, quantity) {
        // Show spinner overlay before updating
        const spinner = document.createElement('div');
        spinner.className = 'mini-cart-loading';
        spinner.innerHTML = `<div class="mini-cart-spinner"></div>`;
        document.getElementById('mini-cart-items').appendChild(spinner);

        try {
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    line,
                    quantity
                })
            });
            await loadCart();
        } catch (err) {
            console.error('Error updating cart:', err);
        } finally {
            // Remove spinner after cart refresh
            spinner.remove();
        }
    }

    /* -------- UNIVERSAL ADD-TO-CART INTERCEPTORS -------- */
    document.addEventListener('submit', async (e) => {
        const form = e.target;
        if (!form || !form.matches('form[action*="/cart/add"]')) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();

        const fd = new FormData(form);
        const id = fd.get('id');
        const qty = Number(fd.get('quantity') || 1);

        await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                id,
                quantity: qty
            })
        });

        if (cfg.enableAutoOpenOnAdd !== false) open();
        else loadCart();
    }, true);

    /* -------- DISCOUNT APPLY HANDLER -------- */
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'mini-cart-discount-apply') {
            e.preventDefault();
            const code = document.getElementById('mini-cart-discount-input')?.value.trim();
            if (!code) return alert('Please enter a discount code.');
            const returnUrl = window.location.pathname + window.location.search;
            const statusEl = document.getElementById('mini-cart-discount-status');
            if (statusEl) statusEl.textContent = 'Applying discount...';
            try {
                await fetch(`/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(returnUrl)}`, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'text/html'
                    }
                });
                await new Promise(r => setTimeout(r, 1000));
                await window.MiniCart.refresh();
                if (statusEl) statusEl.textContent = `Discount "${code}" applied successfully!`;
            } catch (err) {
                console.error('🚨 Error applying discount:', err);
                if (statusEl) statusEl.textContent = 'Error applying discount.';
            }
        }
    });

    /* -------- DISCOUNT REMOVE HANDLER (POLLING) -------- */
    document.addEventListener('click', async (e) => {
        if (e.target.id !== 'mini-cart-remove-discount') return;
        e.preventDefault();

        const statusEl = document.getElementById('mini-cart-discount-status');
        if (statusEl) statusEl.textContent = 'Removing discount...';

        try {
            await fetch('/discount/none', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'text/html'
                }
            });

            // Poll /cart.js until discounts clear
            const maxAttempts = 12;
            const delayMs = 300;
            let attempt = 0,
                cart = null;

            while (attempt < maxAttempts) {
                await new Promise(r => setTimeout(r, delayMs));
                attempt++;
                const res = await fetch('/cart.js', {
                    credentials: 'same-origin'
                });
                cart = await res.json();
                if (!cart.cart_level_discount_applications || cart.cart_level_discount_applications.length === 0) break;
            }

            if (cart) {
                const summary = document.querySelector('.mini-cart-discount-summary');
                if (summary) summary.remove();
                const subtotalEl = document.getElementById('mini-cart-subtotal-amount');
                if (subtotalEl) subtotalEl.textContent = fmt(cart.total_price);
                const input = document.getElementById('mini-cart-discount-input');
                if (input) input.value = '';
                if (statusEl) statusEl.textContent = 'Discount removed successfully.';
                if (window.MiniCart && window.MiniCart.refresh) await window.MiniCart.refresh();
                return;
            }

            if (statusEl) statusEl.textContent = 'Discount removed (timed out checking).';
            const summary = document.querySelector('.mini-cart-discount-summary');
            if (summary) summary.remove();
            if (window.MiniCart && window.MiniCart.refresh) await window.MiniCart.refresh();

        } catch (err) {
            console.error('🚨 Failed to remove discount:', err);
            if (statusEl) statusEl.textContent = 'Error removing discount.';
        }
    });


//  document.addEventListener('click', async (e) => {
//     if (e.target.id === 'remove-gyftr-redemption' || e.target.closest('#remove-gyftr-redemption')) {
//         e.preventDefault();

//         if (!confirm('Remove Gyftr balance from cart?')) return;

//         try {
//             // Clear all Gyftr attributes
//             const response = await fetch('/cart/update.js', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 credentials: 'same-origin',
//                 body: JSON.stringify({
//                     attributes: {
//                         use_gyftr: '',
//                         gyftr_code: '',
//                         gyftr_amount: '',
//                     }
//                 })
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to remove Gyftr redemption');
//             }

//             // Set sessionStorage flag for sync (like discount)
//             sessionStorage.setItem('clearSessionGyftr', 'true');

//             await loadCart();
//         } catch (error) {
//             alert('Failed to remove Gyftr balance. Please try again.');
//         }
//     }
// });

    window.MiniCart = {
        open,
        close,
        refresh: loadCart
    };
    loadCart();
})();

/* ---------- THEME CART OVERRIDE ---------- */
(function() {
    const cartButton = document.querySelector('cart-drawer-component > button');
    if (!cartButton) return;
    const cloned = cartButton.cloneNode(true);
    cartButton.parentNode.replaceChild(cloned, cartButton);
    cloned.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        if (window.MiniCart && window.MiniCart.open) window.MiniCart.open();
    }, true);
    const drawer = document.querySelector('cart-drawer-component');
    if (drawer) drawer.style.display = 'none';
})();
/* ---------- Remove Discount ---------- */
document.addEventListener('click', async (e) => {
    if (e.target.id === 'mini-cart-remove-discount') {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        const formData = new FormData();
        formData.append('discount', '');
        formData.append('update', 'Update cart');
        await fetch('/cart/update.js', {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            }).then(r => r.json())
            .then(updatedCart => {
                console.log("minicart.js discount removal API called via /cart/update.js (FormData)");
                sessionStorage.setItem('clearSessionDiscount', 'true');
                if (window.MiniCart && window.MiniCart.refresh) window.MiniCart.refresh();
            }).catch((error) => {
                console.error("Discount removal error:", error);
                alert('Unable to remove discount. Please try again.');
            });
    }
});
document.addEventListener('click', (e) => {
    const target = e.target.closest('.mini-cart-checkout-btn, .mini-cart-viewcart-btn');
    if (target) {
        if (sessionStorage.getItem('clearSessionDiscount') === 'true') {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            sessionStorage.removeItem('clearSessionDiscount');
            const destinationUrl = target.getAttribute('href') || '/checkout';
            window.location.href = `/discount/clear?redirect=${encodeURIComponent(destinationUrl)}`;
        }
    }
}, true);


/* ---------- Remove Discount ---------- */
document.addEventListener('click', async (e) => {
    console.log
    if (e.target.id === 'mini-cart-remove-discount') {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        const formData = new FormData();
        formData.append('discount', '');
        formData.append('update', 'Update cart');
        await fetch('/cart/update.js', {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            }).then(r => r.json())
            .then(updatedCart => {
                console.log("minicart.js discount removal API called via /cart/update.js (FormData)");
                sessionStorage.setItem('clearSessionDiscount', 'true');
                if (window.MiniCart && window.MiniCart.refresh) window.MiniCart.refresh();
            }).catch((error) => {
                console.error("Discount removal error:", error);
                alert('Unable to remove discount. Please try again.');
            });
    }
});
document.addEventListener('click', (e) => {
    const target = e.target.closest('.mini-cart-checkout-btn, .mini-cart-viewcart-btn');
    if (target) {
        if (sessionStorage.getItem('clearSessionDiscount') === 'true') {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            sessionStorage.removeItem('clearSessionDiscount');
            const destinationUrl = target.getAttribute('href') || '/checkout';
            window.location.href = `/discount/clear?redirect=${encodeURIComponent(destinationUrl)}`;
        }
    }
}, true);
