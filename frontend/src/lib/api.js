import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devcollab_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    if (status === 401) {
      localStorage.removeItem('devcollab_token');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    if (status === 403 && payload?.upgrade) {
      window.location.href = '/upgrade';
    }
    return Promise.reject(error);
  },
);

export const unwrap = (response) => response.data?.data ?? response.data;

export default api;
