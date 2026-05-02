import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const DEFAULT_USER_ID = 1;

function App() {
  const [message, setMessage] = useState('carregando...');
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newUser, setNewUser] = useState({ nome: '', email: '', senha: '' });
  const [resourceType, setResourceType] = useState('expenses');
  const [resourceData, setResourceData] = useState({
    descricao: '',
    valor: '',
    recorrencia: 'mensal',
    tipo: 'fixo',
    data_inicio: '',
    data_fim: '',
  });

  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message || 'OK'))
      .catch((err) => setMessage(`Erro: ${err.message}`));
  }, []);

  const fetchJson = async (url, options) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    const data = await fetchJson(`${API_BASE}/seed-data`, {
      method: 'POST',
    });
    if (data) setResult(data);
  };

  const handleRegister = async () => {
    const data = await fetchJson(`${API_BASE}/api/auth/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (data) {
      setResult(data);
      setUserId(data.usuario.id);
      setNewUser({ nome: '', email: '', senha: '' });
    }
  };

  const handleCreateResource = async () => {
    const body = {
      usuario_id: Number(userId),
      descricao: resourceData.descricao,
      valor: Number(resourceData.valor),
      recorrencia: resourceData.recorrencia,
      data_inicio: resourceData.data_inicio,
      data_fim: resourceData.data_fim || null,
    };

    if (resourceType === 'expenses') {
      body.tipo = resourceData.tipo;
    }

    const data = await fetchJson(`${API_BASE}/api/${resourceType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (data) {
      setResult(data);
      setResourceData({
        descricao: '',
        valor: '',
        recorrencia: 'mensal',
        tipo: 'fixo',
        data_inicio: '',
        data_fim: '',
      });
    }
  };

  const handleSimulate = async () => {
    const data = await fetchJson(`${API_BASE}/api/simulations/simular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: Number(userId) }),
    });
    if (data) setResult(data);
  };

  const handleList = async (type) => {
    const data = await fetchJson(`${API_BASE}/api/${type}/user/${Number(userId)}`);
    if (data) setResult(data);
  };

  return (
    <div className="App">
      <h1>Teste simples da API de Simulação</h1>
      <p>
        API: <strong>{API_BASE}</strong>
      </p>
      <p>Status: <strong>{message}</strong></p>

      <div className="card form-section">
        <h2>Usuário</h2>
        <div className="grid-row">
          <label>
            Usuário ID:
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>
          <button onClick={handleSeed} disabled={loading}>
            Popular dados de exemplo
          </button>
        </div>

        <div className="grid-row">
          <label>
            Nome:
            <input
              type="text"
              value={newUser.nome}
              onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </label>
          <label>
            Senha:
            <input
              type="password"
              value={newUser.senha}
              onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
            />
          </label>
        </div>
        <button onClick={handleRegister} disabled={loading}>
          Criar usuário
        </button>
      </div>

      <div className="card form-section">
        <h2>Cadastrar despesa / renda / dívida</h2>
        <div className="grid-row">
          <label>
            Tipo de recurso:
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
            >
              <option value="expenses">Despesa</option>
              <option value="incomes">Renda</option>
              <option value="debts">Dívida</option>
            </select>
          </label>
          <label>
            Descrição:
            <input
              type="text"
              value={resourceData.descricao}
              onChange={(e) => setResourceData({ ...resourceData, descricao: e.target.value })}
            />
          </label>
          <label>
            Valor:
            <input
              type="number"
              step="0.01"
              value={resourceData.valor}
              onChange={(e) => setResourceData({ ...resourceData, valor: e.target.value })}
            />
          </label>
        </div>

        <div className="grid-row">
          {resourceType === 'expenses' && (
            <label>
              Tipo de despesa:
              <select
                value={resourceData.tipo}
                onChange={(e) => setResourceData({ ...resourceData, tipo: e.target.value })}
              >
                <option value="fixo">Fixo</option>
                <option value="variavel">Variável</option>
              </select>
            </label>
          )}

          <label>
            Recorrência:
            <select
              value={resourceData.recorrencia}
              onChange={(e) => setResourceData({ ...resourceData, recorrencia: e.target.value })}
            >
              <option value="mensal">Mensal</option>
              <option value="semanal">Semanal</option>
              <option value="anual">Anual</option>
              <option value="unica">Única</option>
            </select>
          </label>

          <label>
            Início:
            <input
              type="date"
              value={resourceData.data_inicio}
              onChange={(e) => setResourceData({ ...resourceData, data_inicio: e.target.value })}
            />
          </label>
          <label>
            Fim (opcional):
            <input
              type="date"
              value={resourceData.data_fim}
              onChange={(e) => setResourceData({ ...resourceData, data_fim: e.target.value })}
            />
          </label>
        </div>

        <button onClick={handleCreateResource} disabled={loading}>
          Criar {resourceType === 'expenses' ? 'despesa' : resourceType === 'incomes' ? 'renda' : 'dívida'}
        </button>
      </div>

      <div className="card form-section">
        <h2>Ações rápidas</h2>
        <div className="grid-row">
          <button onClick={handleSimulate} disabled={loading}>
            Simular saldo
          </button>
          <button onClick={() => handleList('expenses')} disabled={loading}>
            Listar despesas
          </button>
          <button onClick={() => handleList('incomes')} disabled={loading}>
            Listar rendas
          </button>
          <button onClick={() => handleList('debts')} disabled={loading}>
            Listar dívidas
          </button>
        </div>
      </div>

      {loading && <p className="info">Carregando...</p>}
      {error && <p className="error">Erro: {error}</p>}
      {result && (
        <pre className="output">{JSON.stringify(result, null, 2)}</pre>
      )}

      <div className="footer">
        <p>
          Crie um usuário novo para usar outro ID ou use o ID atual para testar as funções.
        </p>
      </div>
    </div>
  );
}

export default App;
