export const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value));
};

export const toInputDate = (value = new Date()) => new Date(value).toISOString().split('T')[0];
