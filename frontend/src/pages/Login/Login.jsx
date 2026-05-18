import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { WalletCards } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><WalletCards /> FinControl</div>
        <h1>Entrar na sua conta</h1>
        <p>Acompanhe receitas, despesas, dividas e simulacoes em um painel unico.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Senha<input type="password" required value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} /></label>
          {error && <span className="form-error">{error}</span>}
          <button disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <span>Novo por aqui? <Link to="/cadastro">Criar conta</Link></span>
      </section>
    </main>
  );
};

export default Login;
