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
import AdminHub from './features/admin/components/AdminHub'
import RegistrarUsuario from './features/admin/components/RegistrarUsuario'
import AdminDeportistas from './features/admin/components/AdminDeportistas'
import AdminGaleria from './features/admin/components/AdminGaleria'
import AdminEntrenadores from './features/admin/components/AdminEntrenadores'
import AdminHorarios from './features/admin/components/AdminHorarios'
import AdminPartidos from './features/admin/components/AdminPartidos'
import AdminTorneo from './features/admin/components/AdminTorneo'
import FinanzasPanel from './features/finanzas/components/FinanzasPanel'
import DelegadoPanel from './features/delegado/components/DelegadoPanel'
import EntrenadorPanel from './features/entrenador/components/EntrenadorPanel'
import ApiDocsView from './views/Documentacion/ApiDocsView'
// News editor / CMS module — pending migration by the team (src/pages not yet in repo).
// TODO: restore these imports and the two routes below once the CMS is added.
// import AdminNoticias from './pages/AdminNoticias'
// import MisNoticias from './pages/admin/MisNoticias'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/club" element={<Club />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/noticias/:id" element={<NoticiaDetalle />} />
            <Route path="/inscribete" element={<Inscribete />} />
            <Route path="/admin" element={<AdminHub />} />
            <Route path="/docs" element={<ApiDocsView />} />
            <Route path="/panel-finanzas" element={<FinanzasPanel />} />
            <Route path="/panel-delegado" element={<DelegadoPanel />} />
            <Route path="/panel-entrenador" element={<EntrenadorPanel />} />
            {/* TODO: restore once CMS migrated — <Route path="/admin/mis-noticias" element={<MisNoticias />} /> */}
            <Route path="/admin/registrar-usuario" element={<RegistrarUsuario />} />
            <Route path="/admin/deportistas" element={<AdminDeportistas />} />
            <Route path="/admin/galeria" element={<AdminGaleria />} />
            <Route path="/admin/galeria/:tipo" element={<AdminGaleria />} />
            <Route path="/admin/entrenadores" element={<AdminEntrenadores />} />
            <Route path="/admin/horarios" element={<AdminHorarios />} />
            <Route path="/admin/partidos" element={<AdminPartidos />} />
            <Route path="/admin/torneo" element={<AdminTorneo />} />
          </Route>
          {/* TODO: restore once CMS migrated — <Route path="/noticiasAdmin" element={<AdminNoticias />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
