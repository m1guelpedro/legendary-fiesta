const monthKey = (date) => new Date(date).toISOString().slice(0, 7);

export const calculateTotals = (transactions) => {
  const totals = transactions.reduce(
    (acc, item) => {
      acc[item.type] += Number(item.valor || item.amount || 0);
      return acc;
    },
    { income: 0, expense: 0, debt: 0 },
  );

  return {
    ...totals,
    balance: totals.income - totals.expense - totals.debt,
  };
};

export const groupMonthly = (transactions) => {
  const grouped = {};

  transactions.forEach((item) => {
    const key = monthKey(item.data_inicio);
    grouped[key] ||= { month: key, receitas: 0, despesas: 0, dividas: 0, saldo: 0 };
    const value = Number(item.valor || item.amount || 0);

    if (item.type === 'income') grouped[key].receitas += value;
    if (item.type === 'expense') grouped[key].despesas += value;
    if (item.type === 'debt') grouped[key].dividas += value;
  });

  return Object.values(grouped)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item, index, array) => {
      const current = item.receitas - item.despesas - item.dividas;
      const previous = index ? array[index - 1].saldo : 0;
      return { ...item, saldo: previous + current };
    });
};

export const filterByPeriod = (transactions, start, end) => {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  return transactions.filter((item) => {
    const itemDate = new Date(item.data_inicio);
    return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
  });
};
