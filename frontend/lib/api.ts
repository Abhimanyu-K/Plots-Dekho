import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// Properties API
export const propertiesAPI = {
  getAll: (params?: any) => api.get('/properties', { params }),
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post('/properties', data),
  update: (id: string, data: any) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getMyProperties: (params?: any) => api.get('/properties/my-properties', { params }),
};

// Favorites API
export const favoritesAPI = {
  getAll: (params?: any) => api.get('/favorites', { params }),
  add: (propertyId: string) => api.post(`/favorites/${propertyId}`),
  remove: (propertyId: string) => api.delete(`/favorites/${propertyId}`),
  check: (propertyId: string) => api.get(`/favorites/check/${propertyId}`),
};

// Saved Searches API
export const savedSearchesAPI = {
  getAll: () => api.get('/saved-searches'),
  getById: (id: string) => api.get(`/saved-searches/${id}`),
  create: (data: any) => api.post('/saved-searches', data),
  update: (id: string, data: any) => api.put(`/saved-searches/${id}`, data),
  delete: (id: string) => api.delete(`/saved-searches/${id}`),
  execute: (id: string) => api.get(`/saved-searches/${id}/execute`),
};

// Leads API
export const leadsAPI = {
  send: (propertyId: string, data: any) => api.post(`/leads/property/${propertyId}`, data),
  getSent: (params?: any) => api.get('/leads/sent', { params }),
  getReceived: (params?: any) => api.get('/leads/received', { params }),
  getById: (id: string) => api.get(`/leads/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/leads/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/leads/${id}`),
};

export default api;
