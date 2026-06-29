import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { WalletCards } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    // Validação local: confirmar senha
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas informadas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      // Não enviar o campo confirmarSenha para a API
      const payload = { nome: form.nome, email: form.email, senha: form.senha };
      await register(payload);
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
        <h1>Criar conta</h1>
        <p>Organize seu fluxo financeiro e acompanhe previsoes com clareza.</p>
        <form onSubmit={submit}>
          <label>Nome<input required value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} /></label>
          <label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Senha<input type="password" required minLength="6" value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} /></label>
          <label>Confirmar Senha<input type="password" required minLength="6" value={form.confirmarSenha} onChange={(event) => setForm({ ...form, confirmarSenha: event.target.value })} /></label>
          {error && <span className="form-error">{error}</span>}
          <button disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
        </form>
        <span>Ja tem conta? <Link to="/login">Entrar</Link></span>
      </section>
    </main>
  );
};

export default Register;
