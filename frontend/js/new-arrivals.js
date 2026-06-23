const DAYS_THRESHOLD = 30;

function isNewProduct(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= DAYS_THRESHOLD;
}

function createNewArrivalCard(product) {
  const isNew = isNewProduct(product.createdAt);
  const fallbackImg = `https://placehold.co/600x750/f5f5f4/78716c?text=${encodeURIComponent(product.name)}`;

  return `
    <a href="product.html?id=${product._id}" class="product-card fade-in">
      <div style="position: relative;">
        <img
          src="${product.imageUrl}"
          alt="${product.name}"
          class="product-card-image"
          onerror="this.src='${fallbackImg}'"
        />
        ${isNew ? '<span class="new-badge">NEW</span>' : ''}
        <div class="product-card-overlay">
          <button class="product-card-overlay-btn">View Product</button>
        </div>
      </div>
      <div class="product-card-body">
        <p class="product-card-category">${product.category}</p>
        <h3 class="product-card-name">${product.name}</h3>
        <p class="product-card-price">₹${product.price.toLocaleString('en-IN')}</p>
        <p class="product-card-date">Added ${new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
    </a>
  `;
}

async function loadNewArrivals() {
  const grid = document.getElementById('new-arrivals-grid');
  if (!grid) return;

  grid.innerHTML = Array(4).fill(`<div class="skeleton skeleton-card"></div>`).join('');

  try {
    const products = await ProductAPI.getNewArrivals();

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <p>No new arrivals yet. Check back soon!</p>
          <a href="index.html" class="btn btn-secondary" style="margin-top: 1rem; display: inline-flex;">Browse All Products</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(createNewArrivalCard).join('');

    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach((el) => {
        el.classList.add('visible');
      });
    }, 100);

  } catch (error) {
    grid.innerHTML = `<p>Failed to load products: ${error.message}</p>`;
  }
}

function initSortDropdown() {
  const sortSelect = document.getElementById('arrivals-sort');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', async () => {
    const grid = document.getElementById('new-arrivals-grid');
    const countEl = document.getElementById('arrivals-count');

    grid.innerHTML = Array(4).fill(`<div class="skeleton skeleton-card"></div>`).join('');

    try {
      const products = await apiRequest(`/products?sort=${sortSelect.value}`);
      if (countEl) countEl.textContent = `${products.length} products`;
      grid.innerHTML = products.map(createNewArrivalCard).join('');
      setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
      }, 100);
    } catch (error) {
      grid.innerHTML = `<p>Failed to load: ${error.message}</p>`;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadNewArrivals();
  initSortDropdown();
});