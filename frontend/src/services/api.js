import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cyberguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we got 401 and were attempting a protected call, clear invalid session
      const originalUrl = error.config?.url || '';
      if (!originalUrl.includes('/auth/login') && !originalUrl.includes('/auth/register')) {
        localStorage.removeItem('cyberguard_token');
        localStorage.removeItem('cyberguard_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const formatApiError = (error) => {
  if (!error.response) {
    return 'Unable to connect to CyberGuard server. Please try again.';
  }

  const status = error.response.status;
  if (status === 401) {
    const detail = error.response.data?.detail;
    return typeof detail === 'string' && detail ? detail : 'Invalid email or password.';
  }
  if (status === 422) {
    if (Array.isArray(error.response.data?.detail)) {
      return error.response.data.detail.map((d) => d.msg || d).join(', ');
    }
    return 'Please check the information you entered.';
  }
  if (status === 500) {
    return 'Something went wrong. Please try again later.';
  }

  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((d) => d.msg || d).join(', ');
    }
    return String(error.response.data.detail);
  }
  if (error.response?.data?.message) {
    return String(error.response.data.message);
  }

  return 'An unexpected error occurred. Please try again.';
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const detectAPI = {
  scanUrl: (url) => api.post('/detect', { url }),
  getHistory: (params) => api.get('/detections', { params }),
  getScan: (id) => api.get(`/detections/${id}`),
  deleteScan: (id) => api.delete(`/detections/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export const systemAPI = {
  getHealth: () => api.get('/health'),
};

export default api;
