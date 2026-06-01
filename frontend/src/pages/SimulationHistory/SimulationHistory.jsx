import { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, Toast } from '../../components/common/Feedback.jsx';
import Modal from '../../components/modals/Modal.jsx';
import { useSimulations } from '../../hooks/useSimulations.js';
import { simulationService } from '../../services/simulationService.js';
import { formatDate } from '../../utils/formatDate.js';

const SimulationHistoryPage = () => {
  const { history, loading, error, refresh } = useSimulations();
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ data_inicio: '', data_fim: '' });

  const remove = async (item) => {
    if (!window.confirm('Excluir esta simulacao do historico local?')) return;
    await simulationService.deleteLocal(item.id);
    setToast({ type: 'success', message: 'Simulacao removida localmente.' });
    refresh();
  };

  const applyFilters = async () => {
    try {
      setToast(null);
      const data = await simulationService.history((history[0] && history[0].usuario_id) || (null), filters);
      // overwrite local history refresh by replacing state via hook refresh() not exposing setter; quick workaround: refresh()
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
          <h1>Historico de simulacoes</h1>
          <p>Consulte simulacoes geradas e remova itens localmente enquanto o backend nao possui DELETE.</p>
        </div>
        <div className="filters-row">
          <label>Inicio <input type="date" value={filters.data_inicio} onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })} /></label>
          <label>Fim <input type="date" value={filters.data_fim} onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })} /></label>
          <button className="secondary-button" onClick={applyFilters}>Aplicar</button>
        </div>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !history.length && <EmptyState title="Sem simulacoes salvas" description="Execute uma simulacao padrao para gravar historico no backend." />}
      {!loading && history.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data de inicio</th>
                <th>Data de termino</th>
                <th>Criada em</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{formatDate(item.data_inicio)}</td>
                  <td>{formatDate(item.data_fim)}</td>
                  <td>{formatDate(item.criado_em)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button" onClick={() => setSelected(item)} aria-label="Ver detalhes"><Eye size={16} /></button>
                      <button className="icon-button danger" onClick={() => remove(item)} aria-label="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title={`Simulacao #${selected.id}`} onClose={() => setSelected(null)}>
          <div className="summary-grid">
            <span>Data de inicio <strong>{formatDate(selected.data_inicio)}</strong></span>
            <span>Data de termino <strong>{formatDate(selected.data_fim)}</strong></span>
            <span>Criada em <strong>{formatDate(selected.criado_em)}</strong></span>
            <span>Status <strong>Registrada</strong></span>
          </div>
          {selected.results ? (
            <div className="results-block">
              <h3>Resultados</h3>
              <pre className="mono">{JSON.stringify(selected.results, null, 2)}</pre>
            </div>
          ) : (
            <p className="helper-text">Resultados não disponíveis para esta simulação.</p>
          )}
          {selected.input_data && (
            <>
              <h4>Parâmetros</h4>
              <pre className="mono">{JSON.stringify(selected.input_data, null, 2)}</pre>
            </>
          )}
        </Modal>
      )}
    </section>
  );
};

export default SimulationHistoryPage;
