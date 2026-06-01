import { AlertTriangle, Banknote, CreditCard, TrendingDown, TrendingUp, Wallet, Clock, Activity } from 'lucide-react';
import StatCard from '../../components/cards/StatCard.jsx';
import { BalanceEvolutionChart, RevenueExpenseChart } from '../../components/charts/FinanceCharts.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/Feedback.jsx';
import { useTransactions } from '../../hooks/useTransactions.js';
import { useActivitySummary } from '../../hooks/useActivitySummary.js';
import { calculateTotals, groupMonthly } from '../../utils/finance.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

const Dashboard = () => {
  const { transactions, loading, error } = useTransactions();
  const { resumo, ultimaAtividade, loading: activityLoading } = useActivitySummary();
  const totals = calculateTotals(transactions);
  const monthly = groupMonthly(transactions);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTotals = calculateTotals(transactions.filter((item) => item.data_inicio?.slice(0, 7) === currentMonth));
  const predictedBalance = monthly.at(-1)?.saldo ?? totals.balance;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Dashboard financeiro</h1>
          <p>Visao executiva dos seus lancamentos e projecao de saldo.</p>
        </div>
        <select className="compact-select" defaultValue="month">
          <option value="month">Mes atual</option>
          <option value="year">Ano atual</option>
        </select>
      </div>

      {totals.balance < 0 && (
        <div className="alert-banner"><AlertTriangle size={18} /> Saldo negativo detectado. Revise despesas e dividas recorrentes.</div>
      )}

      <div className="stats-grid">
        <StatCard title="Saldo atual" value={formatCurrency(totals.balance)} icon={Wallet} tone={totals.balance < 0 ? 'danger' : 'primary'} />
        <StatCard title="Receitas" value={formatCurrency(totals.income)} icon={TrendingUp} tone="success" />
        <StatCard title="Despesas" value={formatCurrency(totals.expense)} icon={TrendingDown} tone="danger" />
        <StatCard title="Dividas" value={formatCurrency(totals.debt)} icon={CreditCard} tone="warning" />
        <StatCard title="Saldo previsto" value={formatCurrency(predictedBalance)} icon={Banknote} tone={predictedBalance < 0 ? 'danger' : 'primary'} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Resumo do mes atual</h3>
          <span>{currentMonth}</span>
        </div>
        <div className="summary-grid">
          <span>Receitas <strong>{formatCurrency(currentMonthTotals.income)}</strong></span>
          <span>Despesas <strong>{formatCurrency(currentMonthTotals.expense)}</strong></span>
          <span>Dividas <strong>{formatCurrency(currentMonthTotals.debt)}</strong></span>
          <span>Saldo <strong>{formatCurrency(currentMonthTotals.balance)}</strong></span>
        </div>
      </div>

      {/* Widgets de Atividades */}
      {!activityLoading && resumo && (
        <div className="activity-widgets-grid">
          <div className="activity-widget">
            <div className="widget-icon">
              <Activity size={20} />
            </div>
            <div className="widget-content">
              <h4>Total de Atividades</h4>
              <p className="widget-value">
                {Object.values(resumo).reduce((acc, cat) => acc + Object.values(cat).reduce((a, b) => a + b, 0), 0)}
              </p>
            </div>
          </div>

          <div className="activity-widget">
            <div className="widget-icon" style={{ background: 'var(--color-success)' }}>
              <TrendingUp size={20} />
            </div>
            <div className="widget-content">
              <h4>Receitas Criadas</h4>
              <p className="widget-value">
                {resumo.RECEITA?.CRIADO || 0}
              </p>
            </div>
          </div>

          <div className="activity-widget">
            <div className="widget-icon" style={{ background: 'var(--color-danger)' }}>
              <TrendingDown size={20} />
            </div>
            <div className="widget-content">
              <h4>Despesas Criadas</h4>
              <p className="widget-value">
                {resumo.DESPESA?.CRIADO || 0}
              </p>
            </div>
          </div>

          <div className="activity-widget">
            <div className="widget-icon" style={{ background: 'var(--color-warning)' }}>
              <CreditCard size={20} />
            </div>
            <div className="widget-content">
              <h4>Dívidas Criadas</h4>
              <p className="widget-value">
                {resumo.DIVIDA?.CRIADO || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Última Atividade */}
      {!activityLoading && ultimaAtividade && (
        <div className="panel">
          <div className="panel-header">
            <h3>Última Atividade</h3>
            <Clock size={18} />
          </div>
          <div className="activity-info">
            <p><strong>{ultimaAtividade.descricao}</strong></p>
            <p className="activity-timestamp">{formatDate(ultimaAtividade.created_at)}</p>
          </div>
        </div>
      )}

      {monthly.length ? (
        <div className="charts-grid">
          <RevenueExpenseChart data={monthly} />
          <BalanceEvolutionChart data={monthly} />
        </div>
      ) : (
        <EmptyState title="Nenhum lancamento ainda" description="Cadastre receitas, despesas ou dividas para alimentar os graficos." />
      )}
    </section>
  );
};

export default Dashboard;
