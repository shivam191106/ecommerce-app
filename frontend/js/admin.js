// ===========================
// Access Control
// ===========================
function checkAdminAccess() {
  if (!Session.isLoggedIn() || !Session.isAdmin()) {
    document.getElementById('admin-denied').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
    return false;
  }
  return true;
}

// ===========================
// Tab Switching
// ===========================
function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.panel).classList.add('active');
    });
  });
}

// ===========================
// PRODUCTS PANEL
// ===========================
let currentEditProductId = null;

async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-tbody');
  tbody.innerHTML = `<tr><td colspan="5">Loading products...</td></tr>`;

  try {
    const products = await ProductAPI.getAll();

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No products yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map((p) => `
      <tr>
        <td><img src="${p.imageUrl}" alt="${p.name}" onerror="this.src='https://placehold.co/100x125/f5f5f4/78716c?text=${encodeURIComponent(p.name)}'" /></td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>₹${p.price.toLocaleString('en-IN')}</td>
        <td>${p.stock}</td>
        <td class="admin-table-actions">
          <button class="btn btn-secondary btn-sm edit-product-btn" data-id="${p._id}">Edit</button>
          <button class="btn btn-secondary btn-sm delete-product-btn" data-id="${p._id}" data-name="${p.name}">Delete</button>
        </td>
      </tr>
    `).join('');

    attachProductTableEvents(products);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5">Failed to load products: ${error.message}</td></tr>`;
  }
}

function attachProductTableEvents(products) {
  document.querySelectorAll('.edit-product-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = products.find((p) => p._id === btn.dataset.id);
      openProductModal(product);
    });
  });

  document.querySelectorAll('.delete-product-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const confirmed = confirm(`Delete "${btn.dataset.name}"? This cannot be undone.`);
      if (!confirmed) return;

      try {
        await AdminAPI.deleteProduct(btn.dataset.id);
        loadAdminProducts();
      } catch (error) {
        alert(`Failed to delete: ${error.message}`);
      }
    });
  });
}

function openProductModal(product = null) {
  currentEditProductId = product ? product._id : null;

  document.getElementById('product-modal-title').textContent = product ? 'Edit Product' : 'Add Product';
  document.getElementById('product-name').value = product ? product.name : '';
  document.getElementById('product-description').value = product ? product.description : '';
  document.getElementById('product-price').value = product ? product.price : '';
  document.getElementById('product-category').value = product ? product.category : '';
  document.getElementById('product-stock').value = product ? product.stock : '';
  document.getElementById('product-image').value = product && product.imageUrl ? product.imageUrl : '';

  document.getElementById('product-modal-overlay').classList.add('visible');
}

function closeProductModal() {
  document.getElementById('product-modal-overlay').classList.remove('visible');
  currentEditProductId = null;
}

function initProductModal() {
  document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());
  document.getElementById('product-modal-close').addEventListener('click', closeProductModal);
  document.getElementById('product-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'product-modal-overlay') closeProductModal();
  });

  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productData = {
      name: document.getElementById('product-name').value.trim(),
      description: document.getElementById('product-description').value.trim(),
      price: Number(document.getElementById('product-price').value),
      category: document.getElementById('product-category').value.trim(),
      stock: Number(document.getElementById('product-stock').value),
    };

    const imageUrl = document.getElementById('product-image').value.trim();
    if (imageUrl) productData.imageUrl = imageUrl;

    const submitBtn = document.getElementById('product-form-submit');
    setButtonLoading(submitBtn, true, 'Saving...');

    try {
      if (currentEditProductId) {
        await AdminAPI.updateProduct(currentEditProductId, productData);
      } else {
        await AdminAPI.createProduct(productData);
      }
      closeProductModal();
      loadAdminProducts();
    } catch (error) {
      alert(`Failed to save product: ${error.message}`);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ===========================
// ORDERS PANEL
// ===========================
async function loadAdminOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  tbody.innerHTML = `<tr><td colspan="6">Loading orders...</td></tr>`;

  try {
    const orders = await AdminAPI.getAllOrders();

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No orders yet.</td></tr>`;
      return;
    }

    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    tbody.innerHTML = orders.map((order) => `
      <tr>
        <td>#${order._id.slice(-8).toUpperCase()}</td>
        <td>${order.user ? order.user.name : 'Unknown'}</td>
        <td>${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
        <td>${order.items.length} item(s)</td>
        <td>₹${order.totalAmount.toLocaleString('en-IN')}</td>
        <td>
          <select class="status-select order-status-select" data-id="${order._id}">
            ${statuses.map((s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');

    attachOrderStatusEvents();
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6">Failed to load orders: ${error.message}</td></tr>`;
  }
}

function attachOrderStatusEvents() {
  document.querySelectorAll('.order-status-select').forEach((select) => {
    select.addEventListener('change', async () => {
      try {
        await AdminAPI.updateOrderStatus(select.dataset.id, select.value);
      } catch (error) {
        alert(`Failed to update status: ${error.message}`);
        loadAdminOrders();
      }
    });
  });
}

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAdminAccess()) return;

  initAdminTabs();
  initProductModal();
  loadAdminProducts();
  loadAdminOrders();
});