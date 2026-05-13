const API_BASE = '/api';
const UPLOAD_BASE = '/uploads';

// 获取完整的文件URL
export const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith(UPLOAD_BASE)) return path;
  return `${UPLOAD_BASE}${path}`;
};

// 获取token
const getToken = () => localStorage.getItem('liujing_token');

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('liujing_token');
    localStorage.removeItem('liujing_user');
    // 只有在非公开接口返回401时才跳转登录页
    if (!path.startsWith('/public/')) {
      window.location.href = '/login';
    }
    throw new Error('未登录');
  }

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.message) errMsg = errData.message;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json();
}

// 公开接口
export const publicApi = {
  getHomeData: () => request('/public/home'),
  getContents: (params) => request(`/public/contents?${new URLSearchParams(params)}`),
  getContentById: (id) => request(`/public/contents/${id}`),
  incrementContentView: (id) => request(`/public/contents/${id}/view`, { method: 'POST' }),
  incrementContentLike: (id) => request(`/public/contents/${id}/like`, { method: 'POST' }),
  decrementContentLike: (id) => request(`/public/contents/${id}/unlike`, { method: 'POST' }),
  getPolicies: () => request('/public/policies'),
  getPolicyById: (id) => request(`/public/policies/${id}`),
  getProducts: () => request('/public/products'),
  getBases: () => request('/public/bases'),
  getRegions: () => request('/public/regions'),
  getIndustryItems: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('/public/industry' + qs);
  },
  getIndustryByRegion: (regionId) => request(`/public/industry/${regionId}`),
};

// 管理员接口
export const adminApi = {
  login: (data) => request('/user/login', { method: 'POST', body: JSON.stringify(data) }),
  
  getStats: () => request('/admin/stats'),
  getContents: () => request('/admin/contents'),
  createContent: (data) => request('/admin/contents', { method: 'POST', body: JSON.stringify(data) }),
  updateContent: (id, data) => request(`/admin/contents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContent: (id) => request(`/admin/contents/${id}`, { method: 'DELETE' }),
  
  getUsers: () => request('/admin/users'),
  
  getBases: () => request('/admin/bases'),
  createBase: (data) => request('/admin/bases', { method: 'POST', body: JSON.stringify(data) }),
  updateBase: (id, data) => request(`/admin/bases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBase: (id) => request(`/admin/bases/${id}`, { method: 'DELETE' }),
  
  getProducts: () => request('/admin/products'),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  
  getAppointments: () => request('/admin/appointments'),
  updateAppointmentStatus: (id, status) => request(`/admin/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  
  getPolicies: () => request('/admin/policies'),
  createPolicy: (data) => request('/admin/policies', { method: 'POST', body: JSON.stringify(data) }),
  updatePolicy: (id, data) => request(`/admin/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePolicy: (id) => request(`/admin/policies/${id}`, { method: 'DELETE' }),
};

// 用户接口
export const userApi = {
  login: (data) => request('/user/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/user/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/user/profile'),
  updateProfile: (data) => request('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getFavorites: () => request('/user/favorites'),
  addFavorite: (contentId) => request('/user/favorites', { method: 'POST', body: JSON.stringify({ contentId }) }),
  deleteFavorite: (id) => request(`/user/favorites/${id}`, { method: 'DELETE' }),
  getAppointments: () => request('/user/appointments'),
  createAppointment: (data) => request('/user/appointments', { method: 'POST', body: JSON.stringify(data) }),
  submitFeedback: (data) => request('/user/feedback', { method: 'POST', body: JSON.stringify(data) }),

  // 购物车
  getCart: () => request('/user/cart'),
  addToCart: (productId, quantity = 1) => request('/user/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId, quantity) => request('/user/cart', { method: 'PUT', body: JSON.stringify({ productId, quantity }) }),
  removeFromCart: (productId) => request(`/user/cart/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/user/cart', { method: 'DELETE' }),

  // 订单
  getOrders: () => request('/user/orders'),
  getOrderDetail: (id) => request(`/user/orders/${id}`),
  createOrder: (data) => request('/user/orders', { method: 'POST', body: JSON.stringify(data) }),
  payOrder: (id) => request(`/user/orders/${id}/pay`, { method: 'PUT' }),
  cancelOrder: (id) => request(`/user/orders/${id}/cancel`, { method: 'PUT' }),
};
