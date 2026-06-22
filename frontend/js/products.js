function createProductCard(product) {
  return `
    <a href="product.html?id=${product._id}" class="product-card">
      <div style="position: relative;">
        <img
          src="${product.imageUrl}"
          alt="${product.name}"
          class="product-card-image"
          onerror="this.src='https://placehold.co/600x750/f5f5f4/78716c?text=${encodeURIComponent(product.name)}'"
        />
        <div class="product-card-overlay">
          <button class="product-card-overlay-btn">View Product</button>
        </div>
      </div>
      <div class="product-card-body">
        <p class="product-card-category">${product.category}</p>
        <h3 class="product-card-name">${product.name}</h3>
        <p class="product-card-price">₹${product.price.toLocaleString('en-IN')}</p>
      </div>
    </a>
  `;
}

function buildQueryString(keyword, category) {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (category) params.set('category', category);
  const query = params.toString();
  return query ? `?${query}` : '';
}

async function loadProducts(keyword = '', category = '') {
  const grid = document.getElementById('product-grid');
  const resultsInfo = document.getElementById('filter-results-info');
  if (!grid) return;

  grid.innerHTML = Array(4).fill(`
  <div class="skeleton skeleton-card"></div>
`).join('');

  try {
    const queryString = buildQueryString(keyword, category);
    const products = await ProductAPI.getAll(queryString);

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <p>No products found${keyword ? ` for "${keyword}"` : ''}.</p>
        </div>
      `;
      if (resultsInfo) resultsInfo.textContent = '';
      return;
    }

    grid.innerHTML = products.map(createProductCard).join('');
    window.dispatchEvent(new Event('productsLoaded'));

    if (resultsInfo) {
      const hasFilter = keyword || category;
      resultsInfo.textContent = hasFilter
        ? `${products.length} result${products.length !== 1 ? 's' : ''} found`
        : '';
    }
  } catch (error) {
    grid.innerHTML = `<p>Failed to load products: ${error.message}</p>`;
  }
}

async function populateCategoryDropdown() {
  const select = document.getElementById('category-filter');
  if (!select) return;

  try {
    const allProducts = await ProductAPI.getAll();
    const categories = [...new Set(allProducts.map((p) => p.category))].sort();

    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function initFilterBar() {
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-filter');

  if (!searchInput || !categorySelect) {
    loadProducts();
    return;
  }

  const triggerSearch = () => {
    loadProducts(searchInput.value.trim(), categorySelect.value);
  };

  const debouncedSearch = debounce(triggerSearch, 400);

  searchInput.addEventListener('input', debouncedSearch);
  categorySelect.addEventListener('change', triggerSearch);

  populateCategoryDropdown();
  loadProducts();
}

document.addEventListener('DOMContentLoaded', initFilterBar);