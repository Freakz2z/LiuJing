const API_BASE = '/api';
const UPLOAD_BASE = '/uploads';

const getToken = () => localStorage.getItem('liujing_admin_token');

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('liujing_admin_token');
    window.location.href = '/login';
    throw new Error('未登录');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// 文件上传 - 使用FormData（支持folder_id）
async function uploadFile(endpoint, file, onProgress, folderId = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    if (folderId !== null && folderId !== undefined) {
      formData.append('folder_id', folderId);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message || `Upload failed: ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.open('POST', `${API_BASE}${endpoint}`);
    const token = getToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

export const uploadApi = {
  uploadImage: (file, onProgress, folderId) => uploadFile('/upload/image', file, onProgress, folderId),
  uploadVideo: (file, onProgress, folderId) => uploadFile('/upload/video', file, onProgress, folderId),
};

export const adminApi = {
  login: (data) => request('/user/login', { method: 'POST', body: data }),

  getStats: () => request('/admin/stats'),

  // 轮播图管理
  getBanners: () => request('/admin/banners'),
  createBanner: (data) => request('/admin/banners', { method: 'POST', body: data }),
  updateBanner: (id, data) => request(`/admin/banners/${id}`, { method: 'PUT', body: data }),
  deleteBanner: (id) => request(`/admin/banners/${id}`, { method: 'DELETE' }),

  // 内容管理
  getContents: () => request('/admin/contents'),
  createContent: (data) => request('/admin/contents', { method: 'POST', body: data }),
  updateContent: (id, data) => request(`/admin/contents/${id}`, { method: 'PUT', body: data }),
  deleteContent: (id) => request(`/admin/contents/${id}`, { method: 'DELETE' }),

  // 用户管理
  getUsers: () => request('/admin/users'),

  // 基地管理
  getBases: () => request('/admin/bases'),
  createBase: (data) => request('/admin/bases', { method: 'POST', body: data }),
  updateBase: (id, data) => request(`/admin/bases/${id}`, { method: 'PUT', body: data }),
  deleteBase: (id) => request(`/admin/bases/${id}`, { method: 'DELETE' }),

  // 商品管理
  getProducts: () => request('/admin/products'),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),

  // 预约管理
  getAppointments: () => request('/admin/appointments'),
  updateAppointmentStatus: (id, status) => request(`/admin/appointments/${id}/status`, { method: 'PUT', body: { status } }),

  // 政策管理
  getPolicies: () => request('/admin/policies'),
  getPolicyById: (id) => request(`/admin/policies/${id}`),
  createPolicy: (data) => request('/admin/policies', { method: 'POST', body: data }),
  updatePolicy: (id, data) => request(`/admin/policies/${id}`, { method: 'PUT', body: data }),
  deletePolicy: (id) => request(`/admin/policies/${id}`, { method: 'DELETE' }),

  // 媒体库管理
  getMedia: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/admin/media${qs}`);
  },
  deleteMedia: (data) => request('/admin/media', { method: 'DELETE', body: data }),
  renameMedia: (oldUrl, newFilename) => request('/admin/media/rename', { method: 'POST', body: { oldUrl, newFilename } }),
  moveMedia: (id, folderId) => request(`/admin/media/${id}/move`, { method: 'PUT', body: { folder_id: folderId } }),

  // 媒体文件夹管理
  getMediaFolders: (type) => {
    const qs = type ? '?type=' + type : '';
    return request(`/admin/media/folders${qs}`);
  },
  createMediaFolder: (data) => request('/admin/media/folders', { method: 'POST', body: data }),
  updateMediaFolder: (id, data) => request(`/admin/media/folders/${id}`, { method: 'PUT', body: data }),
  deleteMediaFolder: (id) => request(`/admin/media/folders/${id}`, { method: 'DELETE' }),

  // 地区管理
  getRegions: () => request('/admin/regions'),
  createRegion: (data) => request('/admin/regions', { method: 'POST', body: data }),
  updateRegion: (id, data) => request(`/admin/regions/${id}`, { method: 'PUT', body: data }),
  deleteRegion: (id) => request(`/admin/regions/${id}`, { method: 'DELETE' }),

  // 产业项目管理
  getIndustryItems: () => request('/admin/industry'),
  createIndustryItem: (data) => request('/admin/industry', { method: 'POST', body: data }),
  updateIndustryItem: (id, data) => request(`/admin/industry/${id}`, { method: 'PUT', body: data }),
  deleteIndustryItem: (id) => request(`/admin/industry/${id}`, { method: 'DELETE' }),
};

// 获取完整的文件URL
export const getFileUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith(UPLOAD_BASE)) return p;
  return `${UPLOAD_BASE}${p}`;
};
