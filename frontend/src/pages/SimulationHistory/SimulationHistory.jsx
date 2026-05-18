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

  const remove = async (item) => {
    if (!window.confirm('Excluir esta simulacao do historico local?')) return;
    await simulationService.deleteLocal(item.id);
    setToast({ type: 'success', message: 'Simulacao removida localmente.' });
    refresh();
  };

  return (
    <section className="page-stack">
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <h1>Historico de simulacoes</h1>
          <p>Consulte simulacoes geradas e remova itens localmente enquanto o backend nao possui DELETE.</p>
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
          <p className="helper-text">
            O backend atual salva apenas o periodo da simulacao. Quando a API retornar os resultados completos,
            este modal pode exibir receitas, despesas, dividas e saldo historico.
          </p>
        </Modal>
      )}
    </section>
  );
};

export default SimulationHistoryPage;
