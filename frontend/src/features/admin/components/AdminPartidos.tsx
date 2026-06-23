import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { apiFetch } from '../services/adminService'
import './Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Disciplina { id_disciplina: number; nombre_disciplina: string }
interface Torneo { id_torneo: number; nombre: string }

interface Partido {
  id_partido: number
  id_disciplina: number
  nombre_disciplina: string
  torneo: string
  equipo_local: string
  equipo_visitante: string
  fecha: string
  hora: string
  ubicacion: string
  resultado_local: number | null
  resultado_visitante: number | null
  estado: 'Pendiente' | 'Jugado' | 'Cancelado'
}

// ── Blank form ────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  id_disciplina: '',
  id_torneo: '',
  torneo: '',
  equipo_local: '',
  equipo_visitante: '',
  fecha: '',
  hora: '',
  ubicacion: '',
  estado: 'Pendiente',
  resultado_local: '',
  resultado_visitante: '',
}

type EstadoFilter = 'Todos' | 'Pendiente' | 'Jugado' | 'Cancelado'

// ── Component ─────────────────────────────────────────────────────────────────

function AdminPartidos() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'lista'

  const [partidos, setPartidos] = useState<Partido[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [torneos, setTorneos] = useState<Torneo[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listAlert, setListAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<EstadoFilter>('Todos')

  const [form, setForm] = useState({ ...BLANK_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [editing, setEditing] = useState<Partido | null>(null)
  const [editForm, setEditForm] = useState({ ...BLANK_FORM })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/', { replace: true }); return }

    apiFetch<{ disciplinas: Disciplina[] }>('/api/admin/catalogos/inscripcion')
      .then(data => setDisciplinas(data.disciplinas))
      .catch(() => {})
    apiFetch<Torneo[]>('/api/partidos/torneos')
      .then(setTorneos)
      .catch(() => {})

    loadPartidos()
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  function loadPartidos() {
    setListLoading(true)
    apiFetch<Partido[]>('/api/admin/partidos')
      .then(setPartidos)
      .catch(() => setPartidos([]))
      .finally(() => setListLoading(false))
  }

  const setField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const setEditField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  function buildPayload(f: typeof BLANK_FORM) {
    return {
      id_disciplina: parseInt(f.id_disciplina, 10),
      id_torneo: f.id_torneo ? parseInt(f.id_torneo, 10) : undefined,
      torneo: f.id_torneo
        ? (torneos.find(t => t.id_torneo === parseInt(f.id_torneo, 10))?.nombre ?? f.torneo.trim())
        : f.torneo.trim(),
      equipo_local: f.equipo_local.trim(),
      equipo_visitante: f.equipo_visitante.trim(),
      fecha: f.fecha,
      hora: f.hora,
      ubicacion: f.ubicacion.trim(),
      estado: f.estado,
      resultado_local: f.estado === 'Jugado' && f.resultado_local !== '' ? parseInt(f.resultado_local, 10) : null,
      resultado_visitante: f.estado === 'Jugado' && f.resultado_visitante !== '' ? parseInt(f.resultado_visitante, 10) : null,
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormAlert(null)
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/partidos', {
        method: 'POST',
        body: JSON.stringify(buildPayload(form)),
      })
      setFormAlert({ type: 'success', msg: 'Partido creado correctamente.' })
      setForm({ ...BLANK_FORM })
      loadPartidos()
      setParams({ tab: 'lista' })
    } catch (err: any) {
      setFormAlert({ type: 'error', msg: err.message ?? 'Error al crear el partido.' })
    } finally {
      setSubmitting(false)
    }
  }

  function openEdit(p: Partido) {
    setEditing(p)
    setEditError('')
    const matchedTorneo = torneos.find(t => t.nombre === p.torneo)
    setEditForm({
      id_disciplina: String(p.id_disciplina),
      id_torneo: matchedTorneo ? String(matchedTorneo.id_torneo) : '',
      torneo: p.torneo,
      equipo_local: p.equipo_local,
      equipo_visitante: p.equipo_visitante,
      fecha: p.fecha,
      hora: p.hora,
      ubicacion: p.ubicacion,
      estado: p.estado,
      resultado_local: p.resultado_local != null ? String(p.resultado_local) : '',
      resultado_visitante: p.resultado_visitante != null ? String(p.resultado_visitante) : '',
    })
  }

  function closeEdit() {
    setEditing(null)
    setEditError('')
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    setEditError('')
    setEditSubmitting(true)
    try {
      await apiFetch(`/api/admin/partidos/${editing.id_partido}`, {
        method: 'PUT',
        body: JSON.stringify(buildPayload(editForm)),
      })
      loadPartidos()
      setListAlert({ type: 'success', msg: 'Partido actualizado.' })
      closeEdit()
    } catch (err: any) {
      setEditError(err.message ?? 'No se pudo actualizar el partido.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDelete(p: Partido) {
    if (!window.confirm(`¿Eliminar el partido ${p.equipo_local} vs ${p.equipo_visitante}? Esta acción no se puede deshacer.`)) return
    setListAlert(null)
    setDeletingId(p.id_partido)
    try {
      await apiFetch(`/api/admin/partidos/${p.id_partido}`, { method: 'DELETE' })
      setPartidos(prev => prev.filter(x => x.id_partido !== p.id_partido))
      setListAlert({ type: 'success', msg: 'Partido eliminado.' })
    } catch (err: any) {
      setListAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar el partido.' })
    } finally {
      setDeletingId(null)
    }
  }

  function estadoBadge(estado: Partido['estado']) {
    if (estado === 'Jugado') return <span className="admin-pub-badge published">Jugado</span>
    if (estado === 'Pendiente') return (
      <span className="admin-pub-badge" style={{ background: '#fef3c7', color: '#92400e' }}>Pendiente</span>
    )
    return <span className="admin-pub-badge draft">Cancelado</span>
  }

  // ── Shared form fields ─────────────────────────────────────────────────────

  function renderFormFields(
    f: typeof BLANK_FORM,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  ) {
    return (
      <>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Disciplina *</label>
            <select
              name="id_disciplina"
              className="admin-select"
              value={f.id_disciplina}
              onChange={onChange}
              required
            >
              <option value="">Seleccionar...</option>
              {disciplinas.map(d => (
                <option key={d.id_disciplina} value={d.id_disciplina}>
                  {d.nombre_disciplina}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Torneo *</label>
            {torneos.length > 0 ? (
              <select
                name="id_torneo"
                className="admin-select"
                value={f.id_torneo}
                onChange={onChange}
                required
              >
                <option value="">Seleccionar torneo...</option>
                {torneos.map(t => (
                  <option key={t.id_torneo} value={t.id_torneo}>{t.nombre}</option>
                ))}
              </select>
            ) : (
              <input
                name="torneo"
                className="admin-input"
                value={f.torneo}
                onChange={onChange}
                required
                placeholder="Ej: Torneo Interfacultades 2025"
              />
            )}
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label>Equipo local *</label>
            <input
              name="equipo_local"
              className="admin-input"
              value={f.equipo_local}
              onChange={onChange}
              required
            />
          </div>
          <div className="admin-field">
            <label>Equipo visitante *</label>
            <input
              name="equipo_visitante"
              className="admin-input"
              value={f.equipo_visitante}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label>Fecha *</label>
            <input
              name="fecha"
              type="date"
              className="admin-input"
              value={f.fecha}
              onChange={onChange}
              required
            />
          </div>
          <div className="admin-field">
            <label>Hora *</label>
            <input
              name="hora"
              type="time"
              className="admin-input"
              value={f.hora}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label>Ubicación *</label>
            <input
              name="ubicacion"
              className="admin-input"
              value={f.ubicacion}
              onChange={onChange}
              required
            />
          </div>
          <div className="admin-field">
            <label>Estado</label>
            <select
              name="estado"
              className="admin-select"
              value={f.estado}
              onChange={onChange}
            >
              <option>Pendiente</option>
              <option>Jugado</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>

        {f.estado === 'Jugado' && (
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Resultado local *</label>
              <input
                name="resultado_local"
                type="number"
                min={0}
                className="admin-input"
                value={f.resultado_local}
                onChange={onChange}
                required
              />
            </div>
            <div className="admin-field">
              <label>Resultado visitante *</label>
              <input
                name="resultado_visitante"
                type="number"
                min={0}
                className="admin-input"
                value={f.resultado_visitante}
                onChange={onChange}
                required
              />
            </div>
          </div>
        )}
      </>
    )
  }

  const partidosFiltrados = filtroEstado === 'Todos'
    ? partidos
    : partidos.filter(p => p.estado === filtroEstado)

  const FILTROS: EstadoFilter[] = ['Todos', 'Pendiente', 'Jugado', 'Cancelado']

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Partidos</h1>
        <p>Gestión de partidos y resultados por disciplina y torneo.</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'lista' ? ' active' : ''}`}
          onClick={() => setParams({ tab: 'lista' })}
        >
          Lista
        </button>
        <button
          className={`admin-tab${tab === 'crear' ? ' active' : ''}`}
          onClick={() => setParams({ tab: 'crear' })}
        >
          Crear partido
        </button>
      </div>

      {/* ── Lista ── */}
      {tab === 'lista' && (
        <div className="admin-card">
          {listAlert && (
            <div className={`admin-alert ${listAlert.type}`} style={{ marginBottom: 16 }}>
              {listAlert.msg}
            </div>
          )}

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {FILTROS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltroEstado(f)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  border: `1.5px solid ${filtroEstado === f ? 'var(--ucb-blue)' : 'var(--border-color)'}`,
                  background: filtroEstado === f ? 'var(--ucb-blue)' : '#fff',
                  color: filtroEstado === f ? '#fff' : 'var(--text-light)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {listLoading && <p className="admin-empty">Cargando...</p>}
          {!listLoading && partidosFiltrados.length === 0 && (
            <p className="admin-empty">No hay partidos{filtroEstado !== 'Todos' ? ` con estado "${filtroEstado}"` : ''} registrados.</p>
          )}
          {!listLoading && partidosFiltrados.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Disciplina</th>
                    <th>Local</th>
                    <th>Marcador</th>
                    <th>Visitante</th>
                    <th>Torneo</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {partidosFiltrados.map(p => {
                    const isDeleting = deletingId === p.id_partido
                    return (
                      <tr key={p.id_partido}>
                        <td style={{ whiteSpace: 'nowrap' }}>{p.fecha}</td>
                        <td>{p.nombre_disciplina}</td>
                        <td style={{ fontWeight: 600 }}>{p.equipo_local}</td>
                        <td>
                          {p.resultado_local != null ? (
                            <span style={{
                              fontWeight: 700,
                              fontFamily: 'Montserrat, sans-serif',
                              fontSize: 14,
                              color: 'var(--ucb-blue)',
                              whiteSpace: 'nowrap',
                            }}>
                              {p.resultado_local} – {p.resultado_visitante}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-light)', fontSize: 13 }}>{p.hora}</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.equipo_visitante}</td>
                        <td>{p.torneo}</td>
                        <td>{estadoBadge(p.estado)}</td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-icon-btn edit"
                            onClick={() => openEdit(p)}
                            disabled={isDeleting}
                            title="Editar partido"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn delete"
                            onClick={() => handleDelete(p)}
                            disabled={isDeleting}
                            title="Eliminar partido"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Edit modal ── */}
      {editing && (
        <div className="admin-modal-backdrop" onClick={closeEdit}>
          <div className="admin-modal" onClick={ev => ev.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Editar partido</h2>
              <button type="button" className="admin-modal-close" onClick={closeEdit}>
                <X size={18} />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleEditSubmit}>
              {editError && <div className="admin-alert error">{editError}</div>}
              {renderFormFields(editForm, setEditField)}
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={closeEdit}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Crear ── */}
      {tab === 'crear' && (
        <div className="admin-card">
          {formAlert && (
            <div className={`admin-alert ${formAlert.type}`} style={{ marginBottom: 24 }}>
              {formAlert.msg}
            </div>
          )}
          <form className="admin-form" style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
            <p className="admin-section-title">Datos del partido</p>
            {renderFormFields(form, setField)}
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="admin-btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Crear partido'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminPartidos
