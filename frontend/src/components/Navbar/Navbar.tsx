import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { User, Shield, LogOut, ChevronDown, Newspaper, ShieldCheck, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/torneos', label: 'Torneos' },
  { to: '/club', label: 'Club' },
  { to: '/galeria', label: 'Galería' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/inscribete', label: 'Inscríbete' },
]

// Panel de gestión del grupo 2 (app aparte servida bajo /gestion). Configurable por entorno.
// Se le quita la barra final para no duplicarla al concatenar rutas (.../gestion/panel-admin).
const PANEL_URL = (import.meta.env.VITE_PANEL_URL || '/gestion').replace(/\/+$/, '')

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  const displayName = user
    ? (`${user.nombres ?? ''} ${user.ape_paterno ?? ''}`.trim() || user.email)
    : ''

  // El panel de gestión es solo para admin (1), entrenador (2) y delegado (3).
  // Se matchea por nombre_rol primero (contrato estable con el backend) y cae a id_rol.
  const rol = (user?.nombre_rol ?? '').toLowerCase()


  // El CMS de noticias es para el rol marketing (5). Ruta /noticiasAdmin
  // (pendiente de habilitar en App.tsx por el equipo dueño del CMS).
  const canCms = rol.includes('marketing') || user?.id_rol === 5

  return (
    <nav className="ucb-nav">
      <Link to="/" className="logo-area">
        <img
          src="/ucb-assets/UCB%20escudo.png"
          alt="UCB Escudo"
          className="logo-img"
        />
        <span>Gestión Deportiva</span>
      </Link>
      <div className="nav-links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {l.label}
          </NavLink>
        ))}

        {isAdmin && (
          <a href={`${PANEL_URL}/panel-admin`} className="nav-admin-link">
            <Shield size={15} strokeWidth={2.5} />
            Panel admin
          </a>
        )}

        {!loading && !isAuthenticated && (
          <Link to="/login" className="btn-login">
            <User size={16} strokeWidth={2.5} />
            Inicia Sesión
          </Link>
        )}

        {!loading && isAuthenticated && (
          <div className="nav-user-menu" ref={menuRef}>
            <button
              type="button"
              className={`nav-user-trigger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="nav-user-avatar">
                {(user?.nombres?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}
              </span>
              <span className="nav-user-name">{displayName}</span>
              <ChevronDown size={14} strokeWidth={2.5} />
            </button>
            {menuOpen && (
              <div className="nav-user-dropdown">
                <div className="nav-user-dropdown-header">
                  <p className="nav-user-dropdown-name">{displayName}</p>
                  <p className="nav-user-dropdown-email">{user?.email}</p>
                  <span className="nav-user-dropdown-role">{user?.nombre_rol}</span>
                </div>

                {canCms && (
                  <Link
                    to="/noticiasAdmin"
                    className="nav-user-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Newspaper size={14} strokeWidth={2.2} />
                    CMS de noticias
                  </Link>
                )}
                <Link
                  to="/seguridad/2fa"
                  className="nav-user-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <ShieldCheck size={14} strokeWidth={2.2} />
                  Verificación en dos pasos
                </Link>
                <Link
                  to="/docs"
                  className="nav-user-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <FileText size={14} strokeWidth={2.2} />
                  Documentación API
                </Link>
                <button
                  type="button"
                  className="nav-user-dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={14} strokeWidth={2.2} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
