import { GitCompare, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import StatCard from '../../components/cards/StatCard.jsx';
import { ErrorState, LoadingState } from '../../components/common/Feedback.jsx';
import { useTransactions } from '../../hooks/useTransactions.js';
import { calculateTotals, filterByPeriod } from '../../utils/finance.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { toInputDate } from '../../utils/formatDate.js';

const percent = (current, previous) => {
  if (!previous) return current ? '100%' : '0%';
  return `${(((current - previous) / Math.abs(previous)) * 100).toFixed(1)}%`;
};

const PeriodComparison = () => {
  const { transactions, loading, error } = useTransactions();
  const [periods, setPeriods] = useState({
    aStart: toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    aEnd: toInputDate(new Date()),
    bStart: toInputDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
    bEnd: toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 0)),
  });

  const comparison = useMemo(() => {
    const a = calculateTotals(filterByPeriod(transactions, periods.aStart, periods.aEnd));
    const b = calculateTotals(filterByPeriod(transactions, periods.bStart, periods.bEnd));
    return { a, b };
  }, [transactions, periods]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const rows = [
    ['Receitas', comparison.a.income, comparison.b.income],
    ['Despesas', comparison.a.expense, comparison.b.expense],
    ['Dividas', comparison.a.debt, comparison.b.debt],
    ['Saldo', comparison.a.balance, comparison.b.balance],
  ];

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Comparacao de periodos</h1>
          <p>Compare dois intervalos usando os lancamentos existentes no frontend.</p>
        </div>
      </div>

      <div className="panel comparison-filters">
        <label>Periodo A inicio<input type="date" value={periods.aStart} onChange={(event) => setPeriods({ ...periods, aStart: event.target.value })} /></label>
        <label>Periodo A fim<input type="date" value={periods.aEnd} onChange={(event) => setPeriods({ ...periods, aEnd: event.target.value })} /></label>
        <label>Periodo B inicio<input type="date" value={periods.bStart} onChange={(event) => setPeriods({ ...periods, bStart: event.target.value })} /></label>
        <label>Periodo B fim<input type="date" value={periods.bEnd} onChange={(event) => setPeriods({ ...periods, bEnd: event.target.value })} /></label>
      </div>

      <div className="stats-grid">
        <StatCard title="Saldo periodo A" value={formatCurrency(comparison.a.balance)} icon={Wallet} tone={comparison.a.balance < 0 ? 'danger' : 'primary'} />
        <StatCard title="Saldo periodo B" value={formatCurrency(comparison.b.balance)} icon={Wallet} tone={comparison.b.balance < 0 ? 'danger' : 'primary'} />
        <StatCard title="Variacao do saldo" value={percent(comparison.a.balance, comparison.b.balance)} icon={GitCompare} tone="neutral" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Metrica</th>
              <th>Periodo A</th>
              <th>Periodo B</th>
              <th>Diferenca</th>
              <th>Variacao</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, a, b]) => (
              <tr key={label}>
                <td><strong>{label}</strong></td>
                <td>{formatCurrency(a)}</td>
                <td>{formatCurrency(b)}</td>
                <td>{formatCurrency(a - b)}</td>
                <td>{percent(a, b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PeriodComparison;
