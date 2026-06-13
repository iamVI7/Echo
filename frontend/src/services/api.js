import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
