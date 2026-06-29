import { useState } from 'react';
import { Clock, TrendingDown, TrendingUp, CreditCard, Zap, LogIn, LogOut, User, Search } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/Feedback.jsx';
import Modal from '../../components/modals/Modal.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import '../../styles/history.css';

const categoryIcons = {
  AUTH: LogIn,
  RECEITA: TrendingUp,
  DESPESA: TrendingDown,
  DIVIDA: CreditCard,
  SIMULACAO: Zap,
};

const categoryColors = {
  AUTH: 'primary',
  RECEITA: 'success',
  DESPESA: 'danger',
  DIVIDA: 'warning',
  SIMULACAO: 'info',
};

const ActivityCard = ({ evento, onViewDetails }) => {
  const IconComponent = categoryIcons[evento.categoria] || Clock;
  const colorClass = categoryColors[evento.categoria] || 'primary';

  return (
    <div className="activity-card" onClick={() => onViewDetails(evento)}>
      <div className={`activity-icon icon-${colorClass}`}>
        <IconComponent size={20} />
      </div>
      <div className="activity-content">
        <h4>{evento.descricao}</h4>
        <p className="activity-meta">
          <span className={`badge badge-${evento.tipo_evento.toLowerCase()}`}>
            {evento.tipo_evento}
          </span>
          <span className="activity-date">{formatDate(evento.created_at)}</span>
        </p>
      </div>
      <button className="icon-button" onClick={(e) => {
        e.stopPropagation();
        onViewDetails(evento);
      }}>
        →
      </button>
    </div>
  );
};

const HistoricoAtividades = () => {
  const {
    eventos,
    loading,
    error,
    page,
    limit,
    total,
    pages,
    setLimit,
    applyFilters,
    goToPage,
  } = useHistory();

  const [selectedEvento, setSelectedEvento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipoEvento, setTipoEvento] = useState('');

  const handleApplyFilters = () => {
    applyFilters({
      busca: searchTerm || undefined,
      categoria: categoria || undefined,
      tipoEvento: tipoEvento || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoria('');
    setTipoEvento('');
    applyFilters({});
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Histórico de Atividades</h1>
          <p>Visualize todas as ações realizadas em sua conta.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            <option value="AUTH">Autenticação</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
            <option value="DIVIDA">Dívidas</option>
            <option value="SIMULACAO">Simulações</option>
          </select>

          <select value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)}>
            <option value="">Todos os eventos</option>
            <option value="CRIADO">Criado</option>
            <option value="EDITADO">Editado</option>
            <option value="DELETADO">Deletado</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="EXECUTADO">Executado</option>
          </select>

          <button className="primary-button" onClick={handleApplyFilters}>Aplicar</button>
          <button className="secondary-button" onClick={handleClearFilters}>Limpar</button>
        </div>
      </div>

      {/* Estado de carregamento e erros */}
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {/* Lista de eventos */}
      {!loading && !error && eventos.length === 0 && (
        <EmptyState
          title="Nenhuma atividade encontrada"
          description="Suas atividades aparecerão aqui conforme você interage com o sistema."
        />
      )}

      {!loading && !error && eventos.length > 0 && (
        <>
          <div className="activities-timeline">
            {eventos.map((evento) => (
              <ActivityCard
                key={evento.id}
                evento={evento}
                onViewDetails={setSelectedEvento}
              />
            ))}
          </div>

          {/* Paginação */}
          {pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="secondary-button"
              >
                ← Anterior
              </button>
              <span className="page-info">
                Página {page} de {pages} ({total} total)
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === pages}
                className="secondary-button"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalhes */}
      {selectedEvento && (
        <Modal
          title={`Detalhes - ${selectedEvento.descricao}`}
          onClose={() => setSelectedEvento(null)}
        >
          <div className="event-details">
            <div className="detail-section">
              <h3>Informações Gerais</h3>
              <div className="detail-grid">
                <div>
                  <label>Categoria</label>
                  <span className={`badge badge-${categoryColors[selectedEvento.categoria]}`}>
                    {selectedEvento.categoria}
                  </span>
                </div>
                <div>
                  <label>Tipo de Evento</label>
                  <span>{selectedEvento.tipo_evento}</span>
                </div>
                <div>
                  <label>Data e Hora</label>
                  <span>{formatDate(selectedEvento.created_at)}</span>
                </div>
                <div>
                  <label>Entidade</label>
                  <span>{selectedEvento.entidade || '-'}</span>
                </div>
              </div>
            </div>

            {selectedEvento.dados_anteriores && (
              <div className="detail-section">
                <h3>Dados Anteriores</h3>
                <pre className="data-preview">
                  {JSON.stringify(
                    typeof selectedEvento.dados_anteriores === 'string'
                      ? JSON.parse(selectedEvento.dados_anteriores)
                      : selectedEvento.dados_anteriores,
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            {selectedEvento.dados_novos && (
              <div className="detail-section">
                <h3>Dados Novos</h3>
                <pre className="data-preview">
                  {JSON.stringify(
                    typeof selectedEvento.dados_novos === 'string'
                      ? JSON.parse(selectedEvento.dados_novos)
                      : selectedEvento.dados_novos,
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            {selectedEvento.metadata && (
              <div className="detail-section">
                <h3>Metadados</h3>
                <pre className="data-preview">
                  {JSON.stringify(
                    typeof selectedEvento.metadata === 'string'
                      ? JSON.parse(selectedEvento.metadata)
                      : selectedEvento.metadata,
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
};

export default HistoricoAtividades;
