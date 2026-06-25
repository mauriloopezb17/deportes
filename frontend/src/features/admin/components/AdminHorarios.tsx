import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { apiFetch } from '../services/adminService'
import './Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Disciplina { id_disciplina: number; nombre_disciplina: string }
interface Espacio { id_espacio: number; nombre_espacio: string }

interface EntrenadorRow {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  nombre_disciplina: string
}

interface HorarioInfo {
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  nombre_disciplina: string
  nombre_espacio: string
  entrenador_nombres: string | null
  entrenador_apellido: string | null
}

const DIAS = [
  { label: 'Lunes',     value: 1 },
  { label: 'Martes',    value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves',    value: 4 },
  { label: 'Viernes',   value: 5 },
  { label: 'Sábado',    value: 6 },
  { label: 'Domingo',   value: 7 },
]

const BLANK = {
  id_disciplina: '',
  dia_semana: '',
  hora_inicio: '',
  hora_fin: '',
  id_espacio: '',
  id_entrenador: '',
}

function fmtHora(t: string) { return t?.slice(0, 5) ?? '' }

// ── Component ─────────────────────────────────────────────────────────────────

function AdminHorarios() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'lista'

  const [horarios, setHorarios]       = useState<HorarioInfo[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [espacios, setEspacios]       = useState<Espacio[]>([])
  const [entrenadores, setEntrenadores] = useState<EntrenadorRow[]>([])
  const [listLoading, setListLoading] = useState(true)

  const [form, setForm]           = useState({ ...BLANK })
  const [submitting, setSubmitting] = useState(false)
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/', { replace: true }); return }

    apiFetch<{ disciplinas: Disciplina[] }>('/api/admin/catalogos/inscripcion')
      .then(d => setDisciplinas(d.disciplinas)).catch(() => {})

    apiFetch<Espacio[]>('/api/info/espacios')
      .then(setEspacios).catch(() => {})

    // deduplicate by id_entrenador
    apiFetch<EntrenadorRow[]>('/api/info/entrenadores')
      .then(rows => {
        const seen = new Set<number>()
        setEntrenadores(rows.filter(r => { if (seen.has(r.id_entrenador)) return false; seen.add(r.id_entrenador); return true }))
      }).catch(() => {})

    loadHorarios()
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  function loadHorarios() {
    setListLoading(true)
    apiFetch<HorarioInfo[]>('/api/info/horarios')
      .then(setHorarios).catch(() => setHorarios([])).finally(() => setListLoading(false))
  }

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormAlert(null)
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/horarios/entrenamiento', {
        method: 'POST',
        body: JSON.stringify({
          id_disciplina: parseInt(form.id_disciplina, 10),
          dia_semana:    parseInt(form.dia_semana, 10),
          hora_inicio:   form.hora_inicio,
          hora_fin:      form.hora_fin,
          id_espacio:    parseInt(form.id_espacio, 10),
          id_entrenador: parseInt(form.id_entrenador, 10),
        }),
      })
      setFormAlert({ type: 'success', msg: 'Horario creado correctamente.' })
      setForm({ ...BLANK })
      loadHorarios()
      setParams({ tab: 'lista' })
    } catch (err: any) {
      setFormAlert({ type: 'error', msg: err.message ?? 'Error al crear el horario.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Horarios de entrenamiento</h1>
        <p>Visualización y creación de horarios de entrenamiento del departamento.</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'lista' ? ' active' : ''}`} onClick={() => setParams({ tab: 'lista' })}>
          Lista
        </button>
        <button className={`admin-tab${tab === 'agregar' ? ' active' : ''}`} onClick={() => setParams({ tab: 'agregar' })}>
          Crear horario
        </button>
      </div>

      {/* ── Lista ── */}
      {tab === 'lista' && (
        <div className="admin-card">
          {listLoading && <p className="admin-empty">Cargando...</p>}
          {!listLoading && horarios.length === 0 && (
            <p className="admin-empty">No hay horarios de entrenamiento registrados.</p>
          )}
          {!listLoading && horarios.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Día</th>
                    <th>Horario</th>
                    <th>Espacio</th>
                    <th>Entrenador</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{h.nombre_disciplina}</td>
                      <td>{h.dia_semana}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {fmtHora(h.hora_inicio)} – {fmtHora(h.hora_fin)}
                      </td>
                      <td>{h.nombre_espacio}</td>
                      <td>
                        {h.entrenador_nombres
                          ? `${h.entrenador_nombres} ${h.entrenador_apellido ?? ''}`.trim()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 12 }}>
            La edición y eliminación de horarios estará disponible cuando el backend implemente esos endpoints.
          </p>
        </div>
      )}

      {/* ── Crear ── */}
      {tab === 'agregar' && (
        <div className="admin-card">
          {formAlert && (
            <div className={`admin-alert ${formAlert.type}`} style={{ marginBottom: 24 }}>
              {formAlert.msg}
            </div>
          )}

          <form className="admin-form" style={{ maxWidth: 600 }} onSubmit={handleSubmit}>
            <p className="admin-section-title">Datos del horario</p>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Disciplina *</label>
                <select name="id_disciplina" className="admin-select" value={form.id_disciplina} onChange={set} required>
                  <option value="">Seleccionar...</option>
                  {disciplinas.map(d => (
                    <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre_disciplina}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Día de la semana *</label>
                <select name="dia_semana" className="admin-select" value={form.dia_semana} onChange={set} required>
                  <option value="">Seleccionar...</option>
                  {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Hora de inicio *</label>
                <input name="hora_inicio" type="time" className="admin-input" value={form.hora_inicio} onChange={set} required />
              </div>
              <div className="admin-field">
                <label>Hora de fin *</label>
                <input name="hora_fin" type="time" className="admin-input" value={form.hora_fin} onChange={set} required />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Espacio *</label>
                <select name="id_espacio" className="admin-select" value={form.id_espacio} onChange={set} required>
                  <option value="">Seleccionar espacio</option>
                  {espacios.map(e => (
                    <option key={e.id_espacio} value={e.id_espacio}>
                      {e.nombre_espacio}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Entrenador asignado *</label>
                <select name="id_entrenador" className="admin-select" value={form.id_entrenador} onChange={set} required>
                  <option value="">Seleccionar entrenador</option>
                  {entrenadores.map(e => (
                    <option key={e.id_entrenador} value={e.id_entrenador}>
                      {e.nombres} {e.ape_paterno}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <button type="submit" className="admin-btn-primary" disabled={submitting}>
                {submitting ? 'Creando...' : 'Crear horario'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminHorarios
