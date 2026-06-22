async function loadProductDetail() {
    const container = document.getElementById('product-detail');
    if (!container) return;

    const productId = getQueryParam('id');

    if (!productId) {
        container.innerHTML = `<p>No product specified.</p>`;
        return;
    }

    container.innerHTML = `<p>Loading product...</p>`;

    try {
        const product = await ProductAPI.getById(productId);
        renderProductDetail(product);
    } catch (error) {
        container.innerHTML = `<p>Failed to load product: ${error.message}</p>`;
    }
}

function renderProductDetail(product) {
    const container = document.getElementById('product-detail');

    document.title = `${product.name} — Aurelia`;

    const fallbackImg = `https://placehold.co/800x1000/f5f5f4/78716c?text=${encodeURIComponent(product.name)}`;

    container.innerHTML = `
    <div class="product-detail-image">
      <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='${fallbackImg}'" />
    </div>
    <div class="product-detail-info">
      <p class="product-card-category">${product.category}</p>
      <h1>${product.name}</h1>
      <p class="product-detail-price">₹${product.price.toLocaleString('en-IN')}</p>
      <p class="product-detail-description">${product.description}</p>

      <div class="product-detail-stock">
        ${product.stock > 0
            ? `<span class="stock-in">In Stock (${product.stock} available)</span>`
            : `<span class="stock-out">Out of Stock</span>`
        }
      </div>

      <div class="quantity-selector">
        <label for="quantity" class="form-label">Quantity</label>
        <div class="quantity-controls">
          <button type="button" id="qty-decrease" class="qty-btn">−</button>
          <input type="number" id="quantity" value="1" min="1" max="${product.stock}" />
          <button type="button" id="qty-increase" class="qty-btn">+</button>
        </div>
      </div>

      <button
        class="btn btn-primary btn-block"
        id="add-to-cart-btn"
        ${product.stock === 0 ? 'disabled' : ''}
        data-id="${product._id}"
        data-name="${product.name}"
        data-price="${product.price}"
        data-image="${product.imageUrl}"
        data-stock="${product.stock}"
      >
        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  `;

    setupQuantityControls(product.stock);
    setupAddToCart();
}

function setupQuantityControls(maxStock) {
    const qtyInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('qty-decrease');
    const increaseBtn = document.getElementById('qty-increase');

    decreaseBtn.addEventListener('click', () => {
        const current = parseInt(qtyInput.value, 10) || 1;
        if (current > 1) qtyInput.value = current - 1;
    });

    increaseBtn.addEventListener('click', () => {
        const current = parseInt(qtyInput.value, 10) || 1;
        if (current < maxStock) qtyInput.value = current + 1;
    });
}

function setupAddToCart() {
    const btn = document.getElementById('add-to-cart-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').value, 10) || 1;

        const product = {
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: btn.dataset.price,
            image: btn.dataset.image,
            stock: btn.dataset.stock,
        };

        Cart.addItem(product, quantity);

        const originalText = btn.textContent;
        btn.textContent = 'Added ✓';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1500);

        openCartDrawer();
    });
}

document.addEventListener('DOMContentLoaded', loadProductDetail);