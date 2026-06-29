import { api } from './api.js';

export const historyService = {
  /**
   * Obtém lista de eventos do histórico com filtros e paginação
   */
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.categoria) params.set('categoria', filters.categoria);
    if (filters.tipoEvento) params.set('tipoEvento', filters.tipoEvento);
    if (filters.dataInicio) params.set('dataInicio', filters.dataInicio);
    if (filters.dataFim) params.set('dataFim', filters.dataFim);
    if (filters.busca) params.set('busca', filters.busca);

    return api(`/api/historico?${params.toString()}`);
  },

  /**
   * Obtém detalhes de um evento específico
   */
  getById: (id) => api(`/api/historico/${id}`),

  /**
   * Obtém resumo de atividades (contadores por categoria)
   */
  getResumo: () => api('/api/historico/resumo/atividades'),

  /**
   * Obtém a última atividade registrada
   */
  getUltima: () => api('/api/historico/ultima/atividade'),
};
