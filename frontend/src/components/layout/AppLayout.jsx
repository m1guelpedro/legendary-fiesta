import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, GitCompare, History, LayoutDashboard, LogOut, Menu, ReceiptText, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lancamentos', label: 'Lancamentos', icon: ReceiptText },
  { to: '/simulacoes', label: 'Simulacoes', icon: BarChart3 },
  { to: '/historico', label: 'Historico', icon: History },
  { to: '/comparacao', label: 'Comparacao', icon: GitCompare },
];

const AppLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-icon"><WalletCards size={22} /></span>
          <div>
            <strong>FinControl</strong>
            <small>Planejamento financeiro</small>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span>{user?.nome?.charAt(0)?.toUpperCase() || 'U'}</span>
            <div>
              <strong>{user?.nome}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="ghost-button" onClick={logout}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <strong>Ola, {user?.nome?.split(' ')[0] || 'usuario'}</strong>
            <small>Tenha clareza sobre receitas, gastos e proximos saldos.</small>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
