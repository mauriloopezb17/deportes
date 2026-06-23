import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { apiFetch } from '../services/adminService'
import './Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EntrenadorRow {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  url_foto: string | null
  nombre_disciplina: string
  nombre_categoria: string
}

interface Entrenador {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  disciplinas: string[]
}

// ── Component ─────────────────────────────────────────────────────────────────

function AdminEntrenadores() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/', { replace: true }); return }

    setListLoading(true)
    apiFetch<EntrenadorRow[]>('/api/info/entrenadores')
      .then(rows => {
        const map = new Map<number, Entrenador>()
        for (const r of rows) {
          if (!map.has(r.id_entrenador)) {
            map.set(r.id_entrenador, {
              id_entrenador: r.id_entrenador,
              nombres: r.nombres,
              ape_paterno: r.ape_paterno,
              ape_materno: r.ape_materno,
              disciplinas: [],
            })
          }
          map.get(r.id_entrenador)!.disciplinas.push(r.nombre_disciplina)
        }
        setEntrenadores(Array.from(map.values()))
      })
      .catch(() => setEntrenadores([]))
      .finally(() => setListLoading(false))
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Entrenadores</h1>
        <p>Cuerpo técnico registrado en el departamento de deportes.</p>
      </div>

      <div className="admin-card">
        {listLoading && <p className="admin-empty">Cargando...</p>}
        {!listLoading && entrenadores.length === 0 && (
          <p className="admin-empty">No hay entrenadores registrados aún.</p>
        )}
        {!listLoading && entrenadores.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Disciplinas</th>
                </tr>
              </thead>
              <tbody>
                {entrenadores.map(e => (
                  <tr key={e.id_entrenador}>
                    <td style={{ fontWeight: 600 }}>
                      {e.nombres} {e.ape_paterno}{e.ape_materno ? ` ${e.ape_materno}` : ''}
                    </td>
                    <td>{e.disciplinas.length > 0 ? e.disciplinas.join(', ') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEntrenadores
