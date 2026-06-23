import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus,
  Users,
  UserCheck,
  Newspaper,
  ArrowRight,
  Shield,
  Image as ImageIcon,
  Clock,
  BarChart2,
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import './Admin.css'

const sections = [
  {
    title: 'Gestión de deportistas',
    description: 'Inscripciones y listado de estudiantes deportistas.',
    cards: [
      {
        title: 'Inscribir Deportista',
        desc: 'Registrar a un nuevo estudiante como deportista.',
        icon: UserPlus,
        to: '/admin/deportistas?tab=inscribir',
        accent: 'blue',
      },
      {
        title: 'Lista de Deportistas',
        desc: 'Ver y gestionar los deportistas registrados.',
        icon: Users,
        to: '/admin/deportistas',
        accent: 'blue',
      },
    ],
  },
  {
    title: 'Usuarios del sistema',
    description: 'Cuentas de acceso para administradores, entrenadores y delegados.',
    cards: [
      {
        title: 'Registrar Usuario',
        desc: 'Crear una nueva cuenta de usuario en el sistema.',
        icon: UserCheck,
        to: '/admin/registrar-usuario',
        accent: 'yellow',
      },
    ],
  },
  {
    title: 'Contenido del portal',
    description: 'Redacción y administración de noticias publicadas.',
    cards: [
      {
        title: 'Gestor de Noticias',
        desc: 'Redactar, gestionar y publicar noticias en el portal.',
        icon: Newspaper,
        to: '/noticiasAdmin',
        accent: 'yellow',
      },
    ],
  },
  {
    title: 'Competición',
    description: 'Entrenadores, horarios, partidos y estadísticas de torneos.',
    cards: [
      {
        title: 'Horarios',
        desc: 'Crear y editar los horarios de entrenamiento.',
        icon: Clock,
        to: '/admin/horarios',
        accent: 'blue',
      },
      {
        title: 'Torneo & Estadísticas',
        desc: 'Actualizar posiciones, goleadores y tarjetas.',
        icon: BarChart2,
        to: '/admin/torneo',
        accent: 'blue',
      },
    ],
  },
  {
    title: 'Galería',
    description: 'Fotografías y videos del club deportivo.',
    cards: [
      {
        title: 'Galería multimedia',
        desc: 'Subir y administrar fotos y videos de eventos y partidos.',
        icon: ImageIcon,
        to: '/admin/galeria',
        accent: 'blue',
      },
    ],
  },
] as const

function AdminHub() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) navigate('/login', { replace: true })
    else if (!isAdmin) navigate('/', { replace: true })
  }, [loading, isAuthenticated, isAdmin, navigate])

  const displayName = user
    ? `${user.nombres ?? ''} ${user.ape_paterno ?? ''}`.trim() || user.email
    : ''

  return (
    <div className="admin-page admin-hub-page">
      <div className="admin-hub-banner">
        <div className="admin-hub-banner-left">
          <span className="admin-hub-banner-tag">
            <Shield size={14} strokeWidth={2.5} />
            Panel de administración
          </span>
          <h1>Hola, {displayName}</h1>
          <p>Gestioná deportistas, usuarios y noticias desde un solo lugar.</p>
        </div>
        <div className="admin-hub-banner-right">
          <div className="admin-hub-stat">
            <span className="admin-hub-stat-label">Rol</span>
            <span className="admin-hub-stat-value">{user?.nombre_rol ?? '—'}</span>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="admin-hub-section">
          <div className="admin-hub-section-head">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
          <div className="admin-hub-grid">
            {section.cards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className={`admin-hub-card accent-${card.accent}`}
                >
                  <div className="admin-hub-card-icon">
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div className="admin-hub-card-body">
                    <p className="admin-hub-card-title">{card.title}</p>
                    <p className="admin-hub-card-desc">{card.desc}</p>
                  </div>
                  <span className="admin-hub-card-arrow">
                    <ArrowRight size={16} strokeWidth={2.2} />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default AdminHub
