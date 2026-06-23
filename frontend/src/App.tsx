import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import "./App.css";

import Sidebar from "./shared/components/Sidebar";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { ToastProvider } from "./shared/contexts/ToastContext";

import DashboardAdminPage from "./features/dashboard/pages/DashboardAdminPage";
import CalendarioPage from "./features/calendario/pages/CalendarioPage";
import CalendarioEstudiantePage from "./features/calendario/pages/CalendarioEstudiantePage";
import RegistroDeportistaPage from "./features/deportistas/pages/RegistroDeportistaPage";
import PagosAcademiasPage from "./features/pagos/pages/PagosAcademiasPage";
import GestionDisciplinasPage from "./features/disciplinas/pages/GestionDisciplinasPage";
import AdminReserva from "./features/reservas/components/AdminReserva";
import NuevaReservaPage from "./features/reservas/pages/NuevaReservaPage";
import PerfilPage from "./features/auth/pages/PerfilPage";

function ProtectedLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="app-shell">
      <Sidebar onLogout={handleLogout} />
      <div className="app-content">
        <main className="app-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          
        <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardAdminPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/calendario/consulta" element={<CalendarioEstudiantePage />} />
        <Route path="/deportistas" element={<RegistroDeportistaPage />} />
        <Route path="/pagos" element={<PagosAcademiasPage />} />
        <Route path="/disciplinas" element={<GestionDisciplinasPage />} />
        <Route path="/reservas" element={<AdminReserva />} />
        <Route path="/reservas/nueva" element={<NuevaReservaPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Route>
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;