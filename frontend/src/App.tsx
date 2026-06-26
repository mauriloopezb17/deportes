import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import MainLayout from './views/MainLayout/MainLayout'
import Home from './features/home/components/Home'
import Torneos from './features/torneos/components/Torneos'
import Club from './features/club/components/Club'
import Galeria from './features/galeria/components/Galeria'
import Noticias from './features/noticias/components/Noticias'
import NoticiaDetalle from './features/noticias/components/NoticiaDetalle'
import Inscribete from './features/inscribete/components/Inscribete'
import LoginPage from './features/login/components/LoginPage'
import AuthCallback from './features/login/components/AuthCallback'
import TwoFactorSetup from './features/seguridad/components/TwoFactorSetup'
import FinanzasPanel from './features/finanzas/components/FinanzasPanel'
import AdminNoticias from './views/cms/AdminNoticias'
import ApiDocsView from './views/Documentacion/ApiDocsView'

// Los antiguos paneles de gestión del portal (admin, delegado, entrenador y sus
// sub-herramientas /admin/*) quedaron fuera de ruta: los reemplaza el panel del
// grupo 2 servido bajo /gestion. Sólo siguen en el portal lo que el panel no cubre:
//   - /panel-finanzas  -> pagos del rol jugador
//   - /noticiasAdmin   -> CMS de noticias del rol marketing
// Los componentes viejos siguen en src/features/admin|delegado|entrenador por si se
// necesitan, pero ya no son accesibles desde el portal.

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/seguridad/2fa" element={<TwoFactorSetup />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/club" element={<Club />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/noticias/:id" element={<NoticiaDetalle />} />
            <Route path="/inscribete" element={<Inscribete />} />
            <Route path="/docs" element={<ApiDocsView />} />
            <Route path="/panel-finanzas" element={<FinanzasPanel />} />
            <Route path="/noticiasAdmin" element={<AdminNoticias />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
