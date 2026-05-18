import { api } from './api.js';

export const authService = {
  login: (credentials) => api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (data) => api('/api/auth/registrar', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  profile: () => api('/api/auth/perfil'),

  logout: () => api('/api/auth/logout', { method: 'POST' }),
};
