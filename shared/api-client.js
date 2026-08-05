/* ==========================================================================
   AURA FASHION API CLIENT & AUTHENTICATION MANAGER
   ========================================================================== */

const API_BASE_URL = 'http://localhost:5005/api';

const API = {
  // Token Management
  setToken: (token, role = 'user') => {
    if (role === 'admin') {
      localStorage.setItem('aura_admin_token', token);
    } else {
      localStorage.setItem('aura_user_token', token);
    }
  },

  getToken: (role = 'user') => {
    return role === 'admin' 
      ? localStorage.getItem('aura_admin_token') 
      : localStorage.getItem('aura_user_token');
  },

  clearToken: (role = 'user') => {
    if (role === 'admin') {
      localStorage.removeItem('aura_admin_token');
      localStorage.removeItem('aura_admin_user');
    } else {
      localStorage.removeItem('aura_user_token');
      localStorage.removeItem('aura_current_user');
    }
  },

  getStoredUser: (role = 'user') => {
    const key = role === 'admin' ? 'aura_admin_user' : 'aura_current_user';
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setStoredUser: (user, role = 'user') => {
    const key = role === 'admin' ? 'aura_admin_user' : 'aura_current_user';
    localStorage.setItem(key, JSON.stringify(user));
  },

  // Helper Request Method
  async request(endpoint, options = {}) {
    const role = options.role || 'user';
    const token = API.getToken(role);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'API request failed.');
      }
      return data;
    } catch (err) {
      console.warn(`[API Client Error ${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Auth Operations
  signupUser: async (userData) => {
    const res = await API.request('/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token && res.user) {
      API.setToken(res.token, 'user');
      API.setStoredUser(res.user, 'user');
    }
    return res;
  },

  loginUser: async (credentials) => {
    const res = await API.request('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.token && res.user) {
      API.setToken(res.token, 'user');
      API.setStoredUser(res.user, 'user');
    }
    return res;
  },

  signupAdmin: async (adminData) => {
    const res = await API.request('/auth/admin/signup', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
    if (res.token && res.admin) {
      API.setToken(res.token, 'admin');
      API.setStoredUser(res.admin, 'admin');
    }
    return res;
  },

  loginAdmin: async (credentials) => {
    const res = await API.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.token && res.admin) {
      API.setToken(res.token, 'admin');
      API.setStoredUser(res.admin, 'admin');
    }
    return res;
  },

  getProfile: async (role = 'user') => {
    return await API.request('/auth/me', { role });
  },

  updateProfile: async (data, role = 'user') => {
    const res = await API.request('/auth/profile', {
      method: 'PUT',
      role,
      body: JSON.stringify(data)
    });
    if (res.user || res.admin) {
      API.setStoredUser(res.user || res.admin, role);
    }
    return res;
  },

  // File Upload Operation
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = API.getToken('user') || API.getToken('admin');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'File upload failed');

      // Convert relative URL to full backend URL if necessary
      if (data.url && data.url.startsWith('/uploads')) {
        data.fullUrl = `http://localhost:5005${data.url}`;
      } else {
        data.fullUrl = data.url;
      }
      return data;
    } catch (err) {
      console.error('File Upload Error:', err);
      throw err;
    }
  },

  // Products Operations
  getProducts: async () => {
    try {
      const res = await API.request('/products');
      return res.products || [];
    } catch (err) {
      console.warn('Falling back to local catalog products');
      return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
    }
  },

  addProduct: async (productData) => {
    return await API.request('/products', {
      method: 'POST',
      role: 'admin',
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (id) => {
    return await API.request(`/products/${id}`, {
      method: 'DELETE',
      role: 'admin'
    });
  }
};

window.API = API;
