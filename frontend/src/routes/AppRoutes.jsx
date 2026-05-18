import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Transactions from '../pages/Transactions/Transactions.jsx';
import Simulations from '../pages/Simulations/Simulations.jsx';
import SimulationHistory from '../pages/SimulationHistory/SimulationHistory.jsx';
import PeriodComparison from '../pages/PeriodComparison/PeriodComparison.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Register />} />
    <Route element={<PrivateRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lancamentos" element={<Transactions />} />
        <Route path="/simulacoes" element={<Simulations />} />
        <Route path="/historico" element={<SimulationHistory />} />
        <Route path="/comparacao" element={<PeriodComparison />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
