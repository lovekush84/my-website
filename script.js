// =====================
// MOBILE MENU
// =====================
const navLinks = document.querySelectorAll(".nav-menu .nav-link");
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click", () => {
  document.body.classList.toggle("show-mobile-menu");
});

menuCloseButton.addEventListener("click", () => menuOpenButton.click());

navLinks.forEach(link => {
  link.addEventListener("click", () => menuOpenButton.click());
});

// =====================
// SWIPER
// =====================
const swiper = new Swiper('.slider-wrapper', {
  loop: true,
  grabCursor: true,
  spaceBetween: 25,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    dynamicBullets: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }
});

// =====================
// TOAST NOTIFICATION (alert() ki jagah)
// =====================
function showToast(message, type = 'error') {
  // Existing toast hatao
  const existing = document.getElementById('toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#3b0a0a' : '#1a3010'};
    color: ${type === 'error' ? '#ff9999' : '#7fd870'};
    border: 1px solid ${type === 'error' ? '#6d2020' : '#2d6a20'};
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    z-index: 99999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease;
    white-space: nowrap;
    max-width: 90vw;
    text-align: center;
  `;

  // Animation style inject karo (ek baar)
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// =====================
// CART STATE
// =====================
let cartItems = []; // { name, price, image, qty }
let tip = 0;
let promoDiscount = 0;
let currentPayMethod = 'upi';
let deliveryCharge = 0;

// =====================
// ADD TO CART (Menu buttons)
// =====================
document.querySelectorAll('.select-button').forEach(button => {
  button.addEventListener('click', () => {
    const menuItem = button.closest('.menu-item');
    const name  = menuItem.querySelector('.name').textContent.trim();
    const price = parseInt(menuItem.querySelector('.price').textContent.replace('₹', '').trim());
    const image = menuItem.querySelector('.menu-image').src;

    const existing = cartItems.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cartItems.push({ name, price, image, qty: 1 });
    }

    updateCartBadge();

    // Visual feedback on button
    button.textContent = '✓ ADDED';
    button.style.background = '#2d6a20';
    setTimeout(() => {
      button.textContent = 'ADD CART';
      button.style.background = '';
    }, 1000);
  });
});

// =====================
// CART BADGE
// =====================
function updateCartBadge() {
  const total = cartItems.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cart-count').textContent = total;
}

// =====================
// OPEN / CLOSE CART MODAL
// =====================
document.getElementById('cart-nav-link').addEventListener('click', (e) => {
  e.preventDefault();
  renderCart();
  document.getElementById('cart-modal').style.display = 'flex';
});

document.getElementById('cart-close').addEventListener('click', () => {
  document.getElementById('cart-modal').style.display = 'none';
});

// =====================
// RENDER CART MODAL
// =====================
function renderCart() {
  const cartList = document.getElementById('cart-item-list');
  const footerArea = document.getElementById('cart-footer-area');

  if (cartItems.length === 0) {
    cartList.innerHTML = `
      <div class="cart-empty">
        <span>☕</span>
        <p>Your cart is empty</p>
      </div>`;
    footerArea.innerHTML = '';
    return;
  }

  cartList.innerHTML = cartItems.map((item, index) => `
    <div class="cart-entry">
      <img src="${item.image}" alt="${item.name}" class="cart-entry-img">
      <div class="cart-entry-info">
        <h4>${item.name}</h4>
        <p class="cart-unit-price">₹${item.price} each</p>
      </div>
      <div class="cart-entry-right">
        <span class="cart-line-total">₹${item.price * item.qty}</span>
        <div class="qty-controls">
          <button class="qty-btn minus-btn" onclick="changeQty(${index}, -1)" title="Remove one">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn plus-btn" onclick="changeQty(${index}, 1)" title="Add one">+</button>
          <button class="qty-btn delete-btn" onclick="deleteItem(${index})" title="Remove item">🗑</button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const isFreeDelivery = subtotal >= 500;

  footerArea.innerHTML = `
    <div class="cart-footer">
      <div class="cart-subtotal-row">
        <span>Subtotal (${cartItems.reduce((s,i)=>s+i.qty,0)} items)</span>
        <strong>₹${subtotal}</strong>
      </div>
      <p class="delivery-hint">
        ${isFreeDelivery
          ? '<i class="fas fa-check-circle"></i> Free delivery applied!'
          : `<i class="fas fa-info-circle"></i> Add ₹${500 - subtotal} more for free delivery`}
      </p>
      <button class="checkout-btn" onclick="openCheckout()">
        <i class="fas fa-lock"></i> Proceed to Checkout
      </button>
    </div>
  `;
}

// =====================
// QTY CONTROLS
// =====================
function changeQty(index, delta) {
  cartItems[index].qty += delta;
  if (cartItems[index].qty <= 0) {
    cartItems.splice(index, 1);
  }
  updateCartBadge();
  renderCart();
}

function deleteItem(index) {
  cartItems.splice(index, 1);
  updateCartBadge();
  renderCart();
}

// =====================
// OPEN CHECKOUT
// =====================
function openCheckout() {
  document.getElementById('cart-modal').style.display = 'none';
  document.getElementById('checkout-page').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCheckoutSummary();
  goToStep(1);
}

document.getElementById('back-to-cart').addEventListener('click', () => {
  document.getElementById('checkout-page').classList.remove('open');
  document.body.style.overflow = '';
  renderCart();
  document.getElementById('cart-modal').style.display = 'flex';
});

// =====================
// CHECKOUT STEPS — FIXED ✅
// =====================
function goToStep(n) {
  if (n === 2) {
    const fname = document.getElementById('fname').value.trim();
    const addr  = document.getElementById('addr').value.trim();
    if (!fname || !addr) {
      showToast('Please fill in your name and address to continue.');
      return;
    }
    // Delivery charge set karo
    const delivType = document.getElementById('deliv-type').value;
    deliveryCharge = delivType === 'express' ? 49 : 0;
    renderCheckoutSummary();
  }

  if (n === 3) {
    buildConfirmDetails();
    renderCheckoutSummary();
  }

  [1, 2, 3].forEach(i => {
    const step  = document.getElementById('chk-step-' + i);
    const panel = document.getElementById('panel-' + i);
    step.classList.remove('active', 'done');
    if (i < n) step.classList.add('done');
    else if (i === n) step.classList.add('active');
    panel.style.display = i === n ? 'block' : 'none';
  });

  // Scroll to top of checkout
  document.getElementById('checkout-page').scrollTop = 0;
}

// =====================
// PAYMENT METHOD
// =====================
function selectPayMethod(el, type) {
  document.querySelectorAll('.pay-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  currentPayMethod = type;
  document.getElementById('upi-fields').style.display  = type === 'upi'  ? 'block' : 'none';
  document.getElementById('card-fields').style.display = type === 'card' ? 'block' : 'none';
  document.getElementById('cod-fields').style.display  = type === 'cod'  ? 'block' : 'none';
}

// =====================
// TIP
// =====================
function selectTip(el, amount) {
  document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  tip = amount;
  renderCheckoutSummary();
}

// =====================
// PROMO CODE
// =====================
function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  const msg  = document.getElementById('promo-msg');
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  if (code === 'COFFEE10') {
    promoDiscount = Math.floor(subtotal * 0.1);
    msg.innerHTML = '<p class="promo-success"><i class="fas fa-check-circle"></i> 10% discount applied!</p>';
  } else if (code === 'FIRST50') {
    promoDiscount = 50;
    msg.innerHTML = '<p class="promo-success"><i class="fas fa-check-circle"></i> ₹50 off applied!</p>';
  } else {
    promoDiscount = 0;
    msg.innerHTML = '<p class="promo-error"><i class="fas fa-times-circle"></i> Invalid code. Try COFFEE10 or FIRST50</p>';
  }
  renderCheckoutSummary();
}

// =====================
// RENDER CHECKOUT SUMMARY SIDEBAR
// =====================
function renderCheckoutSummary() {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = Math.max(0, subtotal + tip + deliveryCharge - promoDiscount);

  document.getElementById('chk-summary-items').innerHTML = cartItems.map(item => `
    <div class="sum-item">
      <span>${item.name} ×${item.qty}</span>
      <span>₹${item.price * item.qty}</span>
    </div>
  `).join('');

  document.getElementById('sum-subtotal').textContent  = '₹' + subtotal;
  document.getElementById('sum-total').textContent     = '₹' + total;

  const tipRow  = document.getElementById('sum-tip-row');
  const discRow = document.getElementById('sum-disc-row');
  const delivEl = document.getElementById('sum-delivery');

  if (tip > 0) {
    tipRow.style.display = 'flex';
    document.getElementById('sum-tip').textContent = '₹' + tip;
  } else {
    tipRow.style.display = 'none';
  }

  if (promoDiscount > 0) {
    discRow.style.display = 'flex';
    document.getElementById('sum-disc').textContent = '-₹' + promoDiscount;
  } else {
    discRow.style.display = 'none';
  }

  delivEl.textContent = deliveryCharge > 0 ? '₹' + deliveryCharge : 'Free';
  delivEl.style.color = deliveryCharge > 0 ? '#e8c87a' : '#7fd870';
}

// =====================
// BUILD CONFIRM DETAILS
// =====================
function buildConfirmDetails() {
  const payLabels = { upi: 'UPI Payment', card: 'Credit / Debit Card', cod: 'Cash on Delivery' };
  const subtotal  = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const total     = Math.max(0, subtotal + tip + deliveryCharge - promoDiscount);

  document.getElementById('confirm-details').innerHTML = `
    <div class="confirm-row"><i class="fas fa-user"></i><span>${document.getElementById('fname').value} ${document.getElementById('lname').value}</span></div>
    <div class="confirm-row"><i class="fas fa-phone"></i><span>${document.getElementById('phone').value || 'N/A'}</span></div>
    <div class="confirm-row"><i class="fas fa-map-marker-alt"></i><span>${document.getElementById('addr').value}, ${document.getElementById('city').value} – ${document.getElementById('pin').value}</span></div>
    <div class="confirm-row"><i class="fas fa-truck"></i><span>${document.getElementById('deliv-type').options[document.getElementById('deliv-type').selectedIndex].text}</span></div>
    <div class="confirm-row"><i class="fas fa-credit-card"></i><span>${payLabels[currentPayMethod]}</span></div>
    ${tip > 0 ? `<div class="confirm-row"><i class="fas fa-coffee"></i><span>Barista tip: ₹${tip}</span></div>` : ''}
    ${promoDiscount > 0 ? `<div class="confirm-row"><i class="fas fa-tag"></i><span>Promo discount: -₹${promoDiscount}</span></div>` : ''}
    <div class="confirm-total"><span>Amount to Pay</span><strong>₹${total}</strong></div>
  `;
}

// =====================
// PLACE ORDER
// =====================
function placeOrder() {
  const orderId = '#CF-' + Math.floor(100000 + Math.random() * 900000);
  const now     = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const addr    = document.getElementById('addr').value + ', ' + document.getElementById('city').value;
  const deliv   = document.getElementById('deliv-type').value;

  document.getElementById('order-id-display').textContent = orderId;
  document.getElementById('track-addr').textContent       = addr;
  document.getElementById('tl-time-1').textContent        = now;
  document.getElementById('eta-text').textContent         = deliv === 'express' ? '15–20 min' : '30–45 min';

  // Show tracking page
  document.getElementById('checkout-page').classList.remove('open');
  document.getElementById('tracking-page').classList.add('open');

  // Animate progress bar
  setTimeout(() => { document.getElementById('progress-fill').style.width = '25%'; }, 300);

  // Simulate order progression
  simulateTracking();
}

// =====================
// SIMULATE LIVE TRACKING
// =====================
function simulateTracking() {
  setTimeout(() => {
    document.getElementById('progress-fill').style.width = '50%';
    document.getElementById('progress-status').textContent = 'Preparing your order';
    document.getElementById('progress-pct').textContent    = '50%';
  }, 4000);

  setTimeout(() => {
    markTimelineDone('tl-2');
    markTimelineActive('tl-3');
    document.getElementById('progress-fill').style.width = '75%';
    document.getElementById('progress-status').textContent = 'Out for delivery';
    document.getElementById('progress-pct').textContent    = '75%';
  }, 9000);

  setTimeout(() => {
    markTimelineDone('tl-3');
    markTimelineActive('tl-4');
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('progress-status').textContent = '🎉 Delivered!';
    document.getElementById('progress-pct').textContent    = '100%';
    document.getElementById('progress-fill').style.background = '#7fd870';
  }, 16000);
}

function markTimelineDone(id) {
  const el = document.getElementById(id);
  el.classList.remove('active');
  el.classList.add('done');
  el.querySelector('.tl-dot').innerHTML = '<i class="fas fa-check"></i>';
}

function markTimelineActive(id) {
  const el = document.getElementById(id);
  el.classList.add('active');
}

// =====================
// REORDER / NEW ORDER
// =====================
function reorder() {
  document.getElementById('tracking-page').classList.remove('open');
  document.body.style.overflow = '';
  openCheckout();
}

function newOrder() {
  cartItems     = [];
  tip           = 0;
  promoDiscount = 0;
  deliveryCharge = 0;
  updateCartBadge();
  document.getElementById('tracking-page').classList.remove('open');
  document.body.style.overflow = '';
  ['tl-2','tl-3','tl-4'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('done','active');
  });
  document.getElementById('tl-2').classList.add('active');
  document.getElementById('progress-fill').style.width = '0%';
}

