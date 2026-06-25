import axios from 'axios';

// TOKEN_KEY kept for socket.js which still needs it for Socket.IO auth
// Socket.IO doesn't support cookies so we store a separate socket token
export const TOKEN_KEY = 'devcolab_socket_token';

export const getSocketToken = () => localStorage.getItem(TOKEN_KEY);
export const setSocketToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearSocketToken = () => localStorage.removeItem(TOKEN_KEY);

// Legacy cleanup — remove old localStorage tokens if they exist
export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('devcolab_token');
  localStorage.removeItem('devcollab_token');
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // ← CRITICAL — sends cookies with every request
});

// No more Authorization header interceptor
// Cookie is sent automatically by the browser via withCredentials: true

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAuthToken();
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup') &&
        !window.location.pathname.includes('/invite/accept') &&
        !window.location.pathname.includes('/terms') &&
        !window.location.pathname.includes('/privacy') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const unwrap = (response) => response.data?.data ?? response.data;

export default api;