const CART_KEY = 'aurelia_cart';

const Cart = {
  getItems() {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
  },

  addItem(product, quantity) {
    const items = Cart.getItems();
    const existing = items.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity,
        stock: Number(product.stock),
      });
    }

    Cart.saveItems(items);
  },

  removeItem(productId) {
    const items = Cart.getItems().filter((item) => item.id !== productId);
    Cart.saveItems(items);
  },

  updateQuantity(productId, newQuantity) {
    const items = Cart.getItems();
    const item = items.find((item) => item.id === productId);

    if (item) {
      if (newQuantity < 1) {
        Cart.removeItem(productId);
        return;
      }
      item.quantity = Math.min(newQuantity, item.stock);
      Cart.saveItems(items);
    }
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
  },

  getItemCount() {
    return Cart.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal() {
    return Cart.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
};

// ===========================
// Cart badge (item count icon)
// ===========================
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = Cart.getItemCount();
  badges.forEach((badge) => {
    badge.textContent = count;
  });
}

// ===========================
// Cart Drawer rendering
// ===========================
function renderCartDrawer() {
  const itemsContainer = document.getElementById('cart-drawer-items');
  const footer = document.getElementById('cart-drawer-footer');
  if (!itemsContainer) return;

  const items = Cart.getItems();

  if (items.length === 0) {
    itemsContainer.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    footer.innerHTML = '';
    return;
  }

  itemsContainer.innerHTML = items.map((item) => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image"
        onerror="this.src='https://placehold.co/200x250/f5f5f4/78716c?text=${encodeURIComponent(item.name)}'" />
      <div class="cart-item-details">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</p>
        <div class="cart-item-qty">
          <button class="qty-btn cart-qty-decrease" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn cart-qty-increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">✕</button>
    </div>
  `).join('');

  footer.innerHTML = `
    <div class="cart-subtotal">
      <span>Subtotal</span>
      <span>₹${Cart.getSubtotal().toLocaleString('en-IN')}</span>
    </div>
    <a href="checkout.html" class="btn btn-primary btn-block">Checkout</a>
  `;

  attachCartItemEvents();
}

function attachCartItemEvents() {
  document.querySelectorAll('.cart-qty-decrease').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = Cart.getItems().find((i) => i.id === id);
      if (item) Cart.updateQuantity(id, item.quantity - 1);
      renderCartDrawer();
    });
  });

  document.querySelectorAll('.cart-qty-increase').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = Cart.getItems().find((i) => i.id === id);
      if (item) Cart.updateQuantity(id, item.quantity + 1);
      renderCartDrawer();
    });
  });

  document.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      Cart.removeItem(btn.dataset.id);
      renderCartDrawer();
    });
  });
}

// ===========================
// Drawer open/close
// ===========================
function openCartDrawer() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('visible');
  renderCartDrawer();
}

function closeCartDrawer() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('visible');
}

function initCartDrawer() {
  document.querySelectorAll('.cart-trigger').forEach((btn) => {
    btn.addEventListener('click', openCartDrawer);
  });

  document.getElementById('cart-close-btn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCartDrawer);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initCartDrawer();
});