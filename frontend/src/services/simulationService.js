import { api } from './api.js';

const STORAGE_KEY = 'finance_deleted_simulations';

const getDeletedIds = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

export const simulationService = {
  runDefault: (usuario_id, data_base) => api('/api/simulations/simular', {
    method: 'POST',
    body: JSON.stringify({ usuario_id, data_base }),
  }),

  runPeriod: (payload) => api('/api/simulations/calcular-periodo', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  async history(userId, filters = {}) {
    // filters: { page, limit, data_inicio, data_fim }
    const params = new URLSearchParams();
    if (userId) params.set('usuario_id', userId);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.data_inicio) params.set('data_inicio', filters.data_inicio);
    if (filters.data_fim) params.set('data_fim', filters.data_fim);

    const url = `/api/simulations/historico?${params.toString()}`;
    const data = await api(url);
    const deletedIds = getDeletedIds();
    return (data.simulacoes || []).filter((item) => !deletedIds.includes(item.id));
  },

  async deleteLocal(id) {
    // Mock temporario: o backend atual nao possui endpoint DELETE para simulacoes.
    const deletedIds = Array.from(new Set([...getDeletedIds(), id]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deletedIds));
    return { message: 'Simulacao removida localmente.' };
  },
};
