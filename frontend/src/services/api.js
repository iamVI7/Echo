import axios from 'axios';

// In development, Vite's proxy forwards /api to the local backend (see vite.config.js).
// In production (Vercel), set VITE_API_URL to your deployed backend's base URL,
// e.g. https://project-echo-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 30000
});

// Set token on init
const token = localStorage.getItem('echo_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('echo_token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;