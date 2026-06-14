import api from './api';

export const echoService = {
  getAll: () => api.get('/echoes').then(r => r.data),
  getOne: (id) => api.get(`/echoes/${id}`).then(r => r.data),
  create: (formData) => api.post('/echoes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  open: (id) => api.patch(`/echoes/${id}/open`).then(r => r.data),
  delete: (id) => api.delete(`/echoes/${id}`).then(r => r.data),
};

export const reflectionService = {
  create: (data) => api.post('/reflections', data).then(r => r.data),
  get: (echoId) => api.get(`/reflections/${echoId}`).then(r => r.data),
};

export const userService = {
  getProfile: () => api.get('/users/profile').then(r => r.data),
  deleteAccount: () => api.delete('/users/account').then(r => r.data),
};