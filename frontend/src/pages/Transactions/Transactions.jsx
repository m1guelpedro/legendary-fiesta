import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Modal from '../../components/modals/Modal.jsx';
import TransactionForm from '../../components/forms/TransactionForm.jsx';
import TransactionTable from '../../components/tables/TransactionTable.jsx';
import { EmptyState, ErrorState, LoadingState, Toast } from '../../components/common/Feedback.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTransactions } from '../../hooks/useTransactions.js';
import { transactionService } from '../../services/transactionService.js';

const Transactions = () => {
  const { user } = useAuth();
  const { transactions, loading, error, refresh } = useTransactions();
  const [filters, setFilters] = useState({ type: 'all', category: 'all', search: '', start: '', end: '' });
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => transactions.filter((item) => {
    const matchesType = filters.type === 'all' || item.type === filters.type;
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesText = item.descricao.toLowerCase().includes(filters.search.toLowerCase());
    const itemDate = new Date(item.data_inicio);
    const start = filters.start ? new Date(filters.start) : null;
    const end = filters.end ? new Date(filters.end) : null;
    return matchesType && matchesCategory && matchesText && (!start || itemDate >= start) && (!end || itemDate <= end);
  }), [transactions, filters]);

  const categories = useMemo(() => Array.from(new Set(transactions.map((item) => item.category))).filter(Boolean), [transactions]);

  const save = async (type, payload) => {
    setSaving(true);
    try {
      const body = { ...payload, usuario_id: user.id };
      if (modal?.mode === 'edit') {
        await transactionService.update(type, modal.item.id, body);
      } else {
        await transactionService.create(type, body);
      }
      setToast({ type: 'success', message: 'Lancamento salvo com sucesso.' });
      setModal(null);
      refresh();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Excluir "${item.descricao}"?`)) return;
    try {
      await transactionService.delete(item.type, item.id);
      setToast({ type: 'success', message: 'Lancamento excluido.' });
      refresh();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <section className="page-stack">
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <h1>Lancamentos</h1>
          <p>Gerencie receitas, despesas e dividas em uma tabela unica.</p>
        </div>
        <button onClick={() => setModal({ mode: 'create' })}><Plus size={18} /> Novo lancamento</button>
      </div>

      <div className="filter-bar">
        <input placeholder="Buscar descricao" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
          <option value="all">Todos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
          <option value="debt">Dividas</option>
        </select>
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          <option value="all">Todas categorias</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <input type="date" value={filters.start} onChange={(event) => setFilters({ ...filters, start: event.target.value })} />
        <input type="date" value={filters.end} onChange={(event) => setFilters({ ...filters, end: event.target.value })} />
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !filtered.length && <EmptyState title="Sem lancamentos" description="Use o botao novo lancamento para cadastrar o primeiro registro." />}
      {!loading && filtered.length > 0 && <TransactionTable items={filtered} onEdit={(item) => setModal({ mode: 'edit', item })} onDelete={remove} />}

      {modal && (
        <Modal title={modal.mode === 'edit' ? 'Editar lancamento' : 'Novo lancamento'} onClose={() => setModal(null)}>
          <TransactionForm initialValue={modal.item} onSubmit={save} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}
    </section>
  );
};

export default Transactions;
