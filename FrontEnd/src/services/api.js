import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT on every request ──────────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Global response error handling ───────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════
// AUTH
// ═══════════════════════════════════════
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

// ═══════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ═══════════════════════════════════════
// CART
// ═══════════════════════════════════════
export const cartAPI = {
  get: () => API.get('/cart'),
  addItem: (productId, quantity = 1) =>
    API.post('/cart/items', { productId, quantity }),
  updateItem: (cartItemId, quantity) =>
    API.put(`/cart/items/${cartItemId}`, { quantity }),
  removeItem: (cartItemId) => API.delete(`/cart/items/${cartItemId}`),
  clear: () => API.delete('/cart'),
};

// ═══════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════
export const orderAPI = {
  getAll: () => API.get('/orders'),
  getById: (id) => API.get(`/orders/${id}`),
  place: (shippingAddress) => API.post('/orders', { shippingAddress }),
  updateStatus: (id, status) => API.patch(`/orders/${id}/status`, { status }),
};

export default API;
