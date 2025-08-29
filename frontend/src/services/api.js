import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Courses API
export const coursesAPI = {
  getAll: (params = {}) => api.get('/api/realtime/courses', { params }),
  getById: (id) => api.get(`/api/courses/${id}`), // Keep old endpoint for backward compatibility
  getByCode: (code) => api.get(`/api/realtime/courses/${code}`),
  search: (query, limit = 20) => api.get('/api/realtime/search', { params: { q: query, limit } }),
  getStats: () => api.get('/api/realtime/stats'),
};

// Realtime API - using new format
export const realtimeAPI = {
  getAll: () => api.get('/api/realtime/courses'),
  getByCode: (code) => api.get(`/api/realtime/courses/${code}`),
  search: (query) => api.get('/api/realtime/search', { params: { q: query } }),
  getStats: () => api.get('/api/realtime/stats'),
};

export const fetchCourses = (params = {}) => realtimeAPI.getAll().then(res => res.data.data.courses);
export const fetchCourseById = (id) => coursesAPI.getById(id).then(res => res.data);
export const fetchCourseStats = () => realtimeAPI.getStats().then(res => res.data.data);

// Users API
export const usersAPI = {
  create: (userData) => api.post('/api/users', userData),
  getAll: (params = {}) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  getByEmail: (email) => api.get(`/api/users/email/${email}`),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// Alerts API
export const alertsAPI = {
  create: (alertData) => api.post('/api/alerts', alertData),
  getAll: (params = {}) => api.get('/api/alerts', { params }),
  getById: (id) => api.get(`/api/alerts/${id}`),
  getByUser: (userId) => api.get(`/api/alerts/user/${userId}`),
  update: (id, alertData) => api.put(`/api/alerts/${id}`, alertData),
  delete: (id) => api.delete(`/api/alerts/${id}`),
  checkAndNotify: () => api.post('/api/alerts/check-and-notify'),
};

// Sync API
export const syncAPI = {
  syncCourses: () => api.post('/api/sync/courses/sync-now'),
  getStatus: () => api.get('/api/sync/status'),
};

export default api;