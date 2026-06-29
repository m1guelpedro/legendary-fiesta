import { useState } from 'react';
import { BarChart3, CalendarDays, CreditCard, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import StatCard from '../../components/cards/StatCard.jsx';
import { Toast } from '../../components/common/Feedback.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { simulationService } from '../../services/simulationService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { toInputDate } from '../../utils/formatDate.js';

const Simulations = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ data_inicio: toInputDate(), data_fim: toInputDate(new Date(Date.now() + 30 * 86400000)) });
  const [result, setResult] = useState(null);
  const [defaultResult, setDefaultResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const runPeriod = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await simulationService.runPeriod({ usuario_id: user.id, ...form });
      setResult(data.resultado);
      setToast({ type: 'success', message: 'Simulacao calculada.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const runDefault = async () => {
    setLoading(true);
    try {
      const data = await simulationService.runDefault(user.id, form.data_inicio);
      setDefaultResult(data.simulacoes);
      setToast({ type: 'success', message: 'Projecoes padrao geradas.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <h1>Simulacoes financeiras</h1>
          <p>Calcule saldos previstos por periodo personalizado ou horizontes padrao.</p>
        </div>
      </div>

      <div className="panel">
        <form className="inline-form" onSubmit={runPeriod}>
          <label>Data de inicio<input type="date" required value={form.data_inicio} onChange={(event) => setForm({ ...form, data_inicio: event.target.value })} /></label>
          <label>Data de termino<input type="date" required value={form.data_fim} onChange={(event) => setForm({ ...form, data_fim: event.target.value })} /></label>
          <button disabled={loading}><CalendarDays size={18} /> Calcular periodo</button>
          <button type="button" className="secondary-button" disabled={loading} onClick={runDefault}><BarChart3 size={18} /> Simular 1, 3, 6 e 12 meses</button>
        </form>
      </div>

      {result && (
        <div className="stats-grid">
          <StatCard title="Receitas" value={formatCurrency(result.resumo.totalRenda)} icon={TrendingUp} tone="success" />
          <StatCard title="Despesas" value={formatCurrency(result.resumo.totalDespesas)} icon={TrendingDown} tone="danger" />
          <StatCard title="Dividas" value={formatCurrency(result.resumo.totalDividas)} icon={CreditCard} tone="warning" />
          <StatCard title="Saldo do periodo" value={formatCurrency(result.resumo.saldo)} icon={Wallet} tone={result.resumo.saldo < 0 ? 'danger' : 'primary'} />
        </div>
      )}

      {defaultResult && (
        <div className="panel">
          <div className="panel-header"><h3>Projecoes padrao</h3><span>Saldo previsto</span></div>
          <div className="comparison-grid">
            {Object.entries(defaultResult).map(([key, value]) => (
              <StatCard key={key} title={key.replace('_', ' ')} value={formatCurrency(value.resumo.saldo)} icon={Wallet} tone={value.resumo.saldo < 0 ? 'danger' : 'primary'} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Simulations;
