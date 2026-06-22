function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('checkout-summary-items');
  const totalContainer = document.getElementById('checkout-total');
  const items = Cart.getItems();

  if (items.length === 0) {
    summaryContainer.innerHTML = `<p>Your cart is empty.</p>`;
    document.getElementById('checkout-submit-btn').disabled = true;
    return;
  }

  summaryContainer.innerHTML = items.map((item) => `
    <div class="checkout-summary-item">
      <span class="item-name">${item.name} <span class="item-qty">× ${item.quantity}</span></span>
      <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
    </div>
  `).join('');

  totalContainer.textContent = `₹${Cart.getSubtotal().toLocaleString('en-IN')}`;
}

function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const items = Cart.getItems();
    if (items.length === 0) {
      showFormError('Your cart is empty.');
      return;
    }

    const shippingAddress = {
      fullName: document.getElementById('fullName').value.trim(),
      addressLine: document.getElementById('addressLine').value.trim(),
      city: document.getElementById('city').value.trim(),
      postalCode: document.getElementById('postalCode').value.trim(),
      country: document.getElementById('country').value.trim(),
    };

    const orderData = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingAddress,
    };

    const submitBtn = document.getElementById('checkout-submit-btn');
    setButtonLoading(submitBtn, true, 'Placing order...');

    try {
      await OrderAPI.create(orderData);
      Cart.clear();
      window.location.href = 'profile.html?orderSuccess=true';
    } catch (error) {
      showFormError(error.message);
      setButtonLoading(submitBtn, false);
    }
  });
}

function checkAuthForCheckout() {
  if (!Session.isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthForCheckout();
  renderCheckoutSummary();
  initCheckoutForm();
});