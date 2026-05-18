const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export const api = async (path, options = {}) => {
  const token = localStorage.getItem('finance_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(payload?.error || 'Nao foi possivel concluir a acao.', response.status, payload);
  }

  return payload;
};

export { API_BASE };
