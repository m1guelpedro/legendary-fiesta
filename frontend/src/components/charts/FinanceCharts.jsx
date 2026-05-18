import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

const moneyTick = (value) => formatCurrency(value).replace('R$', 'R$ ');

export const RevenueExpenseChart = ({ data }) => (
  <div className="panel">
    <div className="panel-header">
      <h3>Receitas x despesas</h3>
      <span>Mensal</span>
    </div>
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={moneyTick} width={86} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
          <Bar dataKey="dividas" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const BalanceEvolutionChart = ({ data }) => (
  <div className="panel">
    <div className="panel-header">
      <h3>Evolucao do saldo</h3>
      <span>Acumulado</span>
    </div>
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={moneyTick} width={86} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Area type="monotone" dataKey="saldo" stroke="#2563eb" strokeWidth={3} fill="url(#balanceGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
