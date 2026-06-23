const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://aurelia-backend-bhve.onrender.com/api';

// Generic request helper used by all API calls
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, config);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data && data.message) || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

// ===========================
// Product API calls
// ===========================
const ProductAPI = {
  getAll(queryParams = '') {
    return apiRequest(`/products${queryParams}`);
  },
  getById(id) {
    return apiRequest(`/products/${id}`);
  },
  getNewArrivals() {
    return apiRequest('/products?newArrival=true&sort=newest');
  },
};

// ===========================
// Auth API calls
// ===========================
const AuthAPI = {
  register(name, email, password) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// ===========================
// Session helpers (localStorage)
// ===========================
const Session = {
  setUser(userData) {
    localStorage.setItem('aurelia_user', JSON.stringify(userData));
  },
  getUser() {
    const data = localStorage.getItem('aurelia_user');
    return data ? JSON.parse(data) : null;
  },
  getToken() {
    const user = Session.getUser();
    return user ? user.token : null;
  },
  isLoggedIn() {
    return !!Session.getUser();
  },
  isAdmin() {
    const user = Session.getUser();
    return user ? user.role === 'admin' : false;
  },
  logout() {
    localStorage.removeItem('aurelia_user');
  },
};

// ===========================
// Order API calls
// ===========================
const OrderAPI = {
  create(orderData) {
    return apiRequest('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Session.getToken()}` },
      body: JSON.stringify(orderData),
    });
  },
  getMyOrders() {
    return apiRequest('/orders/myorders', {
      headers: { Authorization: `Bearer ${Session.getToken()}` },
    });
  },
};

// ===========================
// Admin API calls
// ===========================
const AdminAPI = {
  createProduct(productData) {
    return apiRequest('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Session.getToken()}` },
      body: JSON.stringify(productData),
    });
  },
  updateProduct(id, productData) {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${Session.getToken()}` },
      body: JSON.stringify(productData),
    });
  },
  deleteProduct(id) {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${Session.getToken()}` },
    });
  },
  getAllOrders() {
    return apiRequest('/orders', {
      headers: { Authorization: `Bearer ${Session.getToken()}` },
    });
  },
  updateOrderStatus(orderId, status) {
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${Session.getToken()}` },
      body: JSON.stringify({ status }),
    });
  },
};


// ===========================
// URL helper
// ===========================
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}