function createOrderCard(order) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const itemsHtml = order.items.map((item) => `
    <div class="order-item-row">
      <span>${item.name} × ${item.quantity}</span>
      <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
    </div>
  `).join('');

  return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <p class="order-card-id">Order #${order._id.slice(-8).toUpperCase()}</p>
          <p class="order-card-date">${orderDate}</p>
        </div>
        <span class="status-badge status-${order.status}">${order.status}</span>
      </div>
      ${itemsHtml}
      <div class="order-card-total">
        <span>Total</span>
        <span>₹${order.totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>
  `;
}

async function loadMyOrders() {
  const container = document.getElementById('orders-list');
  if (!container) return;

  if (!Session.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  container.innerHTML = `<p>Loading your orders...</p>`;

  try {
    const orders = await OrderAPI.getMyOrders();

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <a href="index.html" class="btn btn-secondary" style="margin-top: 1rem; display: inline-flex;">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(createOrderCard).join('');
  } catch (error) {
    container.innerHTML = `<p>Failed to load orders: ${error.message}</p>`;
  }
}

function checkOrderSuccess() {
  if (getQueryParam('orderSuccess') === 'true') {
    const banner = document.getElementById('order-success-banner');
    if (banner) banner.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkOrderSuccess();
  loadMyOrders();
});