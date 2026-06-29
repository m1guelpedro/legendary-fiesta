import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/app.css';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
