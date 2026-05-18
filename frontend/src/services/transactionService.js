import { api } from './api.js';

const resourceMap = {
  income: { path: 'incomes', responseKey: 'renda', listKey: 'rendas' },
  expense: { path: 'expenses', responseKey: 'despesa', listKey: 'despesas' },
  debt: { path: 'debts', responseKey: 'divida', listKey: 'dividas' },
};

const normalize = (item, type) => ({
  ...item,
  type,
  amount: Number(item.valor || 0),
  category: item.categoria || (type === 'income' ? 'Receita' : type === 'expense' ? item.tipo || 'Despesa' : 'Divida'),
});

export const transactionService = {
  async listAll(userId) {
    const [incomes, expenses, debts] = await Promise.all([
      api(`/api/incomes/user/${userId}`),
      api(`/api/expenses/user/${userId}`),
      api(`/api/debts/user/${userId}`),
    ]);

    return [
      ...(incomes.rendas || []).map((item) => normalize(item, 'income')),
      ...(expenses.despesas || []).map((item) => normalize(item, 'expense')),
      ...(debts.dividas || []).map((item) => normalize(item, 'debt')),
    ].sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));
  },

  async create(type, payload) {
    const resource = resourceMap[type];
    const data = await api(`/api/${resource.path}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalize(data[resource.responseKey], type);
  },

  async update(type, id, payload) {
    const resource = resourceMap[type];
    const data = await api(`/api/${resource.path}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalize(data[resource.responseKey], type);
  },

  delete(type, id) {
    const resource = resourceMap[type];
    return api(`/api/${resource.path}/${id}`, { method: 'DELETE' });
  },
};
