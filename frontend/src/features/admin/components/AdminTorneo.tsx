import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { apiFetch } from '../services/adminService'
import './Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Torneo {
  id_torneo: number
  nombre: string
  disciplina: string
  activo: boolean
}

interface PosicionRow {
  id_equipo: number        // real API uses id_equipo
  id_posicion?: number     // kept for write operations (not yet implemented)
  nombre_equipo: string    // real API field name
  equipo?: string          // alias — populated from nombre_equipo on read
  short?: string           // generated client-side
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dg: number
  pts: number
}

interface Goleador {
  id_deportista: number    // real API field
  id_goleador?: number     // kept for write operations
  jugador: string
  equipo: string
  goles: number
}

interface TarjetaRow {
  id_equipo: number        // real API field
  id_tarjeta?: number      // kept for write operations
  equipo: string
  amarillas: number
  rojas: number
}

// ── Blank forms ───────────────────────────────────────────────────────────────

const BLANK_POSICION = {
  equipo: '', short: '',
  pj: '', pg: '', pe: '', pp: '',
  gf: '', gc: '', dg: '', pts: '',
}

const BLANK_GOLEADOR = { jugador: '', equipo: '', goles: '' }

const BLANK_TARJETA = { equipo: '', amarillas: '', rojas: '' }

type SubTab = 'posiciones' | 'goleadores' | 'tarjetas'

// ── Modal types ───────────────────────────────────────────────────────────────

type PosicionModal =
  | { mode: 'add' }
  | { mode: 'edit'; row: PosicionRow }

type GoleadorModal =
  | { mode: 'add' }
  | { mode: 'edit'; row: Goleador }

type TarjetaModal =
  | { mode: 'add' }
  | { mode: 'edit'; row: TarjetaRow }

// ── Component ─────────────────────────────────────────────────────────────────

function AdminTorneo() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [torneos, setTorneos] = useState<Torneo[]>([])
  const [selectedTorneo, setSelectedTorneo] = useState<number | null>(null)
  const [subTab, setSubTab] = useState<SubTab>('posiciones')

  // Posiciones
  const [posiciones, setPosiciones] = useState<PosicionRow[]>([])
  const [posLoading, setPosLoading] = useState(false)
  const [posAlert, setPosAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [posModal, setPosModal] = useState<PosicionModal | null>(null)
  const [posForm, setPosForm] = useState({ ...BLANK_POSICION })
  const [posSubmitting, setPosSubmitting] = useState(false)
  const [posModalError, setPosModalError] = useState('')

  // Goleadores
  const [goleadores, setGoleadores] = useState<Goleador[]>([])
  const [golLoading, setGolLoading] = useState(false)
  const [golAlert, setGolAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [golModal, setGolModal] = useState<GoleadorModal | null>(null)
  const [golForm, setGolForm] = useState({ ...BLANK_GOLEADOR })
  const [golSubmitting, setGolSubmitting] = useState(false)
  const [golModalError, setGolModalError] = useState('')

  // Tarjetas
  const [tarjetas, setTarjetas] = useState<TarjetaRow[]>([])
  const [tarLoading, setTarLoading] = useState(false)
  const [tarAlert, setTarAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [tarModal, setTarModal] = useState<TarjetaModal | null>(null)
  const [tarForm, setTarForm] = useState({ ...BLANK_TARJETA })
  const [tarSubmitting, setTarSubmitting] = useState(false)
  const [tarModalError, setTarModalError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/', { replace: true }); return }

    apiFetch<Torneo[]>('/api/partidos/torneos')
      .then(data => {
        setTorneos(data)
        if (data.length > 0) setSelectedTorneo(data[0].id_torneo)
      })
      .catch(() => {})
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  useEffect(() => {
    if (selectedTorneo == null) return
    loadPosiciones()
    loadGoleadores()
    loadTarjetas()
  }, [selectedTorneo])

  // ── Loaders ────────────────────────────────────────────────────────────────

  function loadPosiciones() {
    if (selectedTorneo == null) return
    setPosLoading(true)
    apiFetch<PosicionRow[]>(`/api/partidos/posiciones/${selectedTorneo}`)
      .then(setPosiciones)
      .catch(() => setPosiciones([]))
      .finally(() => setPosLoading(false))
  }

  function loadGoleadores() {
    if (selectedTorneo == null) return
    setGolLoading(true)
    apiFetch<Goleador[]>(`/api/partidos/goleadores/${selectedTorneo}`)
      .then(setGoleadores)
      .catch(() => setGoleadores([]))
      .finally(() => setGolLoading(false))
  }

  function loadTarjetas() {
    if (selectedTorneo == null) return
    setTarLoading(true)
    apiFetch<TarjetaRow[]>(`/api/partidos/tarjetas/${selectedTorneo}`)
      .then(setTarjetas)
      .catch(() => setTarjetas([]))
      .finally(() => setTarLoading(false))
  }

  // ── Posiciones modal ───────────────────────────────────────────────────────

  function openPosEdit(row: PosicionRow) {
    const nombre = row.nombre_equipo ?? row.equipo ?? ''
    setPosForm({
      equipo: nombre,
      short: row.short ?? nombre.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase(),
      pj: String(row.pj),
      pg: String(row.pg),
      pe: String(row.pe),
      pp: String(row.pp),
      gf: String(row.gf),
      gc: String(row.gc),
      dg: String(row.dg),
      pts: String(row.pts),
    })
    setPosModalError('')
    setPosModal({ mode: 'edit', row })
  }

  function setPosField(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setPosForm(prev => {
      const updated = { ...prev, [name]: value }
      if ((name === 'gf' || name === 'gc') && updated.gf !== '' && updated.gc !== '') {
        const dg = parseInt(updated.gf, 10) - parseInt(updated.gc, 10)
        updated.dg = String(dg)
      }
      return updated
    })
  }

  async function handlePosSubmit(e: FormEvent) {
    e.preventDefault()
    if (!posModal || selectedTorneo == null) return
    setPosModalError('')
    setPosSubmitting(true)
    const payload = {
      equipo: posForm.equipo.trim(),
      short: posForm.short.trim(),
      pj: parseInt(posForm.pj, 10),
      pg: parseInt(posForm.pg, 10),
      pe: parseInt(posForm.pe, 10),
      pp: parseInt(posForm.pp, 10),
      gf: parseInt(posForm.gf, 10),
      gc: parseInt(posForm.gc, 10),
      dg: posForm.dg.trim(),
      pts: parseInt(posForm.pts, 10),
    }
    try {
      if (posModal.mode === 'add') {
        await apiFetch(`/api/admin/torneos/${selectedTorneo}/posiciones`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setPosAlert({ type: 'success', msg: 'Equipo agregado a la tabla.' })
      } else {
        await apiFetch(`/api/admin/torneos/${selectedTorneo}/posiciones/${posModal.row.id_equipo ?? posModal.row.id_posicion}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setPosAlert({ type: 'success', msg: 'Posición actualizada.' })
      }
      loadPosiciones()
      setPosModal(null)
    } catch (err: any) {
      setPosModalError(err.message ?? 'Error al guardar.')
    } finally {
      setPosSubmitting(false)
    }
  }

  async function handlePosDelete(row: PosicionRow) {
    const nombre = row.nombre_equipo ?? row.equipo ?? 'este equipo'
    if (!window.confirm(`¿Eliminar a ${nombre} de la tabla? Esta acción no se puede deshacer.`)) return
    if (selectedTorneo == null) return
    setPosAlert(null)
    try {
      const rowId = row.id_equipo ?? row.id_posicion
      await apiFetch(`/api/admin/torneos/${selectedTorneo}/posiciones/${rowId}`, { method: 'DELETE' })
      setPosiciones(prev => prev.filter(x => x.id_equipo !== row.id_equipo))
      setPosAlert({ type: 'success', msg: `${nombre} eliminado de la tabla.` })
    } catch (err: any) {
      setPosAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar.' })
    }
  }

  // ── Goleadores modal ───────────────────────────────────────────────────────

  function openGolAdd() {
    setGolForm({ ...BLANK_GOLEADOR })
    setGolModalError('')
    setGolModal({ mode: 'add' })
  }

  function openGolEdit(row: Goleador) {
    setGolForm({ jugador: row.jugador, equipo: row.equipo, goles: String(row.goles) })
    setGolModalError('')
    setGolModal({ mode: 'edit', row })
  }

  const setGolField = (e: React.ChangeEvent<HTMLInputElement>) =>
    setGolForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  async function handleGolSubmit(e: FormEvent) {
    e.preventDefault()
    if (!golModal || selectedTorneo == null) return
    setGolModalError('')
    setGolSubmitting(true)
    const payload = {
      jugador: golForm.jugador.trim(),
      equipo: golForm.equipo.trim(),
      goles: parseInt(golForm.goles, 10),
    }
    try {
      if (golModal.mode === 'add') {
        await apiFetch(`/api/admin/torneos/${selectedTorneo}/goleadores`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setGolAlert({ type: 'success', msg: 'Goleador agregado.' })
      } else {
        await apiFetch(`/api/admin/torneos/${selectedTorneo}/goleadores/${golModal.row.id_deportista ?? golModal.row.id_goleador}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setGolAlert({ type: 'success', msg: 'Goleador actualizado.' })
      }
      loadGoleadores()
      setGolModal(null)
    } catch (err: any) {
      setGolModalError(err.message ?? 'Error al guardar.')
    } finally {
      setGolSubmitting(false)
    }
  }

  async function handleGolDelete(row: Goleador) {
    if (!window.confirm(`¿Eliminar a ${row.jugador} de los goleadores? Esta acción no se puede deshacer.`)) return
    if (selectedTorneo == null) return
    setGolAlert(null)
    try {
      const golId = row.id_deportista ?? row.id_goleador
      await apiFetch(`/api/admin/torneos/${selectedTorneo}/goleadores/${golId}`, { method: 'DELETE' })
      setGoleadores(prev => prev.filter(x => (x.id_deportista ?? x.id_goleador) !== golId))
      setGolAlert({ type: 'success', msg: `${row.jugador} eliminado.` })
    } catch (err: any) {
      setGolAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar.' })
    }
  }

  // ── Tarjetas modal ─────────────────────────────────────────────────────────

  function openTarEdit(row: TarjetaRow) {
    setTarForm({ equipo: row.equipo, amarillas: String(row.amarillas), rojas: String(row.rojas) })
    setTarModalError('')
    setTarModal({ mode: 'edit', row })
  }

  const setTarField = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTarForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  async function handleTarSubmit(e: FormEvent) {
    e.preventDefault()
    if (!tarModal || selectedTorneo == null) return
    setTarModalError('')
    setTarSubmitting(true)
    const payload = {
      equipo: tarForm.equipo.trim(),
      amarillas: parseInt(tarForm.amarillas, 10),
      rojas: parseInt(tarForm.rojas, 10),
    }
    try {
      if (tarModal.mode === 'add') {
        await apiFetch(`/api/admin/torneos/${selectedTorneo}/tarjetas`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setTarAlert({ type: 'success', msg: 'Equipo agregado.' })
      } else {
        await apiFetch(`/api/admin/torneos/${selectedTorneo}/tarjetas/${tarModal.row.id_equipo ?? tarModal.row.id_tarjeta}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setTarAlert({ type: 'success', msg: 'Tarjetas actualizadas.' })
      }
      loadTarjetas()
      setTarModal(null)
    } catch (err: any) {
      setTarModalError(err.message ?? 'Error al guardar.')
    } finally {
      setTarSubmitting(false)
    }
  }

  async function handleTarDelete(row: TarjetaRow) {
    if (!window.confirm(`¿Eliminar a ${row.equipo} del registro de tarjetas? Esta acción no se puede deshacer.`)) return
    if (selectedTorneo == null) return
    setTarAlert(null)
    try {
      const tarId = row.id_equipo ?? row.id_tarjeta
      await apiFetch(`/api/admin/torneos/${selectedTorneo}/tarjetas/${tarId}`, { method: 'DELETE' })
      setTarjetas(prev => prev.filter(x => (x.id_equipo ?? x.id_tarjeta) !== tarId))
      setTarAlert({ type: 'success', msg: `${row.equipo} eliminado.` })
    } catch (err: any) {
      setTarAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar.' })
    }
  }

  // ── Sorted data ────────────────────────────────────────────────────────────

  const goleadoresOrdenados = [...goleadores].sort((a, b) => b.goles - a.goles)
  const tarjetasOrdenadas = [...tarjetas].sort((a, b) => b.rojas - a.rojas || b.amarillas - a.amarillas)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Torneo</h1>
        <p>Gestión de posiciones, goleadores y tarjetas por torneo.</p>
      </div>

      {/* ── Torneo selector ── */}
      <div className="admin-card" style={{ marginBottom: 16, padding: '20px 32px' }}>
        {torneos.length === 0 ? (
          <p className="admin-placeholder" style={{ padding: '16px 0', textAlign: 'left' }}>
            No hay torneos disponibles.
          </p>
        ) : (
          <div className="admin-field" style={{ maxWidth: 400 }}>
            <label>Torneo</label>
            <select
              className="admin-select"
              value={selectedTorneo ?? ''}
              onChange={e => setSelectedTorneo(parseInt(e.target.value, 10))}
            >
              {torneos.map(t => (
                <option key={t.id_torneo} value={t.id_torneo}>
                  {t.nombre} — {t.disciplina}{t.activo ? ' (activo)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedTorneo != null && torneos.length > 0 && (
        <>
          {/* ── Sub-tabs ── */}
          <div className="admin-tabs">
            <button
              className={`admin-tab${subTab === 'posiciones' ? ' active' : ''}`}
              onClick={() => setSubTab('posiciones')}
            >
              Posiciones
            </button>
            <button
              className={`admin-tab${subTab === 'goleadores' ? ' active' : ''}`}
              onClick={() => setSubTab('goleadores')}
            >
              Goleadores
            </button>
            <button
              className={`admin-tab${subTab === 'tarjetas' ? ' active' : ''}`}
              onClick={() => setSubTab('tarjetas')}
            >
              Tarjetas
            </button>
          </div>

          {/* ────────── Posiciones ────────── */}
          {subTab === 'posiciones' && (
            <div className="admin-card">
              {posAlert && (
                <div className={`admin-alert ${posAlert.type}`} style={{ marginBottom: 16 }}>
                  {posAlert.msg}
                </div>
              )}
              {posLoading && <p className="admin-empty">Cargando...</p>}
              {!posLoading && posiciones.length === 0 && (
                <p className="admin-empty">No hay equipos en la tabla de posiciones.</p>
              )}
              {!posLoading && posiciones.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Pos</th>
                        <th>Equipo</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PE</th>
                        <th>PP</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>DG</th>
                        <th>Pts</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posiciones.map((row, idx) => {
                        const nombre = row.nombre_equipo ?? row.equipo ?? '—'
                        const abbr = row.short ?? nombre.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()
                        return (
                        <tr key={row.id_equipo ?? row.id_posicion ?? idx}>
                          <td style={{ fontWeight: 700, color: 'var(--ucb-blue)' }}>{idx + 1}</td>
                          <td>
                            <span style={{ fontWeight: 700 }}>{nombre}</span>{' '}
                            <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>
                              ({abbr})
                            </span>
                          </td>
                          <td>{row.pj}</td>
                          <td>{row.pg}</td>
                          <td>{row.pe}</td>
                          <td>{row.pp}</td>
                          <td>{row.gf}</td>
                          <td>{row.gc}</td>
                          <td>{row.dg > 0 ? `+${row.dg}` : row.dg}</td>
                          <td style={{ fontWeight: 700 }}>{row.pts}</td>
                          <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="admin-icon-btn edit"
                              onClick={() => openPosEdit(row)}
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn delete"
                              onClick={() => handlePosDelete(row)}
                              title="Eliminar"
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

          {/* ────────── Goleadores ────────── */}
          {subTab === 'goleadores' && (
            <div className="admin-card">
              {golAlert && (
                <div className={`admin-alert ${golAlert.type}`} style={{ marginBottom: 16 }}>
                  {golAlert.msg}
                </div>
              )}
              {golLoading && <p className="admin-empty">Cargando...</p>}
              {!golLoading && goleadoresOrdenados.length === 0 && (
                <p className="admin-empty">No hay goleadores registrados.</p>
              )}
              {!golLoading && goleadoresOrdenados.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Jugador</th>
                        <th>Equipo</th>
                        <th>Goles</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goleadoresOrdenados.map((row, idx) => (
                        <tr key={row.id_deportista ?? row.id_goleador}>
                          <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{row.jugador}</td>
                          <td>{row.equipo}</td>
                          <td style={{ fontWeight: 700, color: 'var(--ucb-blue)' }}>{row.goles}</td>
                          <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="admin-icon-btn edit"
                              onClick={() => openGolEdit(row)}
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn delete"
                              onClick={() => handleGolDelete(row)}
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <button type="button" className="admin-btn-primary" onClick={openGolAdd}>
                  + Agregar goleador
                </button>
              </div>
            </div>
          )}

          {/* ────────── Tarjetas ────────── */}
          {subTab === 'tarjetas' && (
            <div className="admin-card">
              {tarAlert && (
                <div className={`admin-alert ${tarAlert.type}`} style={{ marginBottom: 16 }}>
                  {tarAlert.msg}
                </div>
              )}
              {tarLoading && <p className="admin-empty">Cargando...</p>}
              {!tarLoading && tarjetasOrdenadas.length === 0 && (
                <p className="admin-empty">No hay registros de tarjetas.</p>
              )}
              {!tarLoading && tarjetasOrdenadas.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Equipo</th>
                        <th>Amarillas 🟨</th>
                        <th>Rojas 🟥</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tarjetasOrdenadas.map(row => (
                        <tr key={row.id_equipo ?? row.id_tarjeta}>
                          <td style={{ fontWeight: 600 }}>{row.equipo}</td>
                          <td style={{ fontWeight: 700 }}>{row.amarillas}</td>
                          <td style={{ fontWeight: 700, color: '#dc2626' }}>{row.rojas}</td>
                          <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="admin-icon-btn edit"
                              onClick={() => openTarEdit(row)}
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn delete"
                              onClick={() => handleTarDelete(row)}
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Posiciones modal ── */}
      {posModal && (
        <div className="admin-modal-backdrop" onClick={() => setPosModal(null)}>
          <div className="admin-modal" onClick={ev => ev.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{posModal.mode === 'add' ? 'Agregar equipo' : 'Editar posición'}</h2>
              <button type="button" className="admin-modal-close" onClick={() => setPosModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form className="admin-form" onSubmit={handlePosSubmit}>
              {posModalError && <div className="admin-alert error">{posModalError}</div>}

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Equipo *</label>
                  <input
                    name="equipo"
                    className="admin-input"
                    value={posForm.equipo}
                    onChange={setPosField}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label>Abreviación *</label>
                  <input
                    name="short"
                    className="admin-input"
                    value={posForm.short}
                    onChange={setPosField}
                    required
                    maxLength={4}
                    placeholder="Ej: FCB"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>PJ *</label>
                  <input name="pj" type="number" min={0} className="admin-input" value={posForm.pj} onChange={setPosField} required />
                </div>
                <div className="admin-field">
                  <label>PG *</label>
                  <input name="pg" type="number" min={0} className="admin-input" value={posForm.pg} onChange={setPosField} required />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>PE *</label>
                  <input name="pe" type="number" min={0} className="admin-input" value={posForm.pe} onChange={setPosField} required />
                </div>
                <div className="admin-field">
                  <label>PP *</label>
                  <input name="pp" type="number" min={0} className="admin-input" value={posForm.pp} onChange={setPosField} required />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>GF *</label>
                  <input name="gf" type="number" min={0} className="admin-input" value={posForm.gf} onChange={setPosField} required />
                </div>
                <div className="admin-field">
                  <label>GC *</label>
                  <input name="gc" type="number" min={0} className="admin-input" value={posForm.gc} onChange={setPosField} required />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>DG</label>
                  <input
                    name="dg"
                    className="admin-input"
                    value={posForm.dg}
                    onChange={setPosField}
                    placeholder="Auto-calculado"
                  />
                </div>
                <div className="admin-field">
                  <label>Pts *</label>
                  <input name="pts" type="number" min={0} className="admin-input" value={posForm.pts} onChange={setPosField} required />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setPosModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={posSubmitting}>
                  {posSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Goleadores modal ── */}
      {golModal && (
        <div className="admin-modal-backdrop" onClick={() => setGolModal(null)}>
          <div className="admin-modal" onClick={ev => ev.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{golModal.mode === 'add' ? 'Agregar goleador' : 'Editar goleador'}</h2>
              <button type="button" className="admin-modal-close" onClick={() => setGolModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleGolSubmit}>
              {golModalError && <div className="admin-alert error">{golModalError}</div>}

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Jugador *</label>
                  <input
                    name="jugador"
                    className="admin-input"
                    value={golForm.jugador}
                    onChange={setGolField}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label>Equipo *</label>
                  <input
                    name="equipo"
                    className="admin-input"
                    value={golForm.equipo}
                    onChange={setGolField}
                    required
                  />
                </div>
              </div>

              <div className="admin-field" style={{ maxWidth: 180 }}>
                <label>Goles *</label>
                <input
                  name="goles"
                  type="number"
                  min={0}
                  className="admin-input"
                  value={golForm.goles}
                  onChange={setGolField}
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setGolModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={golSubmitting}>
                  {golSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tarjetas modal ── */}
      {tarModal && (
        <div className="admin-modal-backdrop" onClick={() => setTarModal(null)}>
          <div className="admin-modal" onClick={ev => ev.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{tarModal.mode === 'add' ? 'Agregar equipo' : 'Editar tarjetas'}</h2>
              <button type="button" className="admin-modal-close" onClick={() => setTarModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleTarSubmit}>
              {tarModalError && <div className="admin-alert error">{tarModalError}</div>}

              <div className="admin-field">
                <label>Equipo *</label>
                <input
                  name="equipo"
                  className="admin-input"
                  value={tarForm.equipo}
                  onChange={setTarField}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Amarillas *</label>
                  <input
                    name="amarillas"
                    type="number"
                    min={0}
                    className="admin-input"
                    value={tarForm.amarillas}
                    onChange={setTarField}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label>Rojas *</label>
                  <input
                    name="rojas"
                    type="number"
                    min={0}
                    className="admin-input"
                    value={tarForm.rojas}
                    onChange={setTarField}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setTarModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={tarSubmitting}>
                  {tarSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTorneo
