import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, X, Plus, Upload } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { apiFetch, API_BASE, getToken } from '../services/adminService'
import './Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GaleriaItem {
  id_multimedia: number
  url_archivo: string
  tipo_archivo: string
  publicado: boolean
  id_torneo: number | null
  id_partido: number | null
  id_espacio: number | null
  id_carrera: number | null
  fecha_subida: string
  autor_nombres: string
  autor_apellido: string
}

interface Torneo { id_torneo: number; nombre: string }

interface Partido {
  id_partido: number
  equipo_local: string
  equipo_visitante: string
}

const BLANK = {
  tipo_archivo: 'foto',
  url_archivo: '',
  publicado: false,
  id_torneo: '',
  id_partido: '',
}

// ── Component ─────────────────────────────────────────────────────────────────

function AdminGaleria() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [items, setItems]           = useState<GaleriaItem[]>([])
  const [torneos, setTorneos]       = useState<Torneo[]>([])
  const [partidos, setPartidos]     = useState<Partido[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listAlert, setListAlert]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [typeFilter, setTypeFilter] = useState<'todos' | 'foto' | 'video'>('todos')

  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState({ ...BLANK })
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/', { replace: true }); return }
    loadItems()
    apiFetch<Torneo[]>('/api/partidos/torneos').then(setTorneos).catch(() => {})
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  useEffect(() => {
    if (form.id_torneo) {
      apiFetch<Partido[]>(`/api/partidos/torneo/${form.id_torneo}`)
        .then(setPartidos).catch(() => setPartidos([]))
    } else {
      setPartidos([])
    }
  }, [form.id_torneo])

  function loadItems() {
    setListLoading(true)
    apiFetch<GaleriaItem[]>('/api/galeria/')
      .then(setItems).catch(() => setItems([])).finally(() => setListLoading(false))
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error('Error al subir el archivo.')
      const data = await res.json()
      setForm(f => ({ ...f, url_archivo: data.url }))
    } catch (err: any) {
      setModalError(err.message ?? 'Error al subir.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setModalError('')
    if (!form.url_archivo.trim()) { setModalError('Ingresá una URL o subí un archivo.'); return }
    setSubmitting(true)
    try {
      await apiFetch('/api/galeria/', {
        method: 'POST',
        body: JSON.stringify({
          url_archivo: form.url_archivo.trim(),
          tipo_archivo: form.tipo_archivo,
          publicado: form.publicado,
          id_torneo: form.id_torneo ? parseInt(form.id_torneo, 10) : null,
          id_partido: form.id_partido ? parseInt(form.id_partido, 10) : null,
        }),
      })
      setListAlert({ type: 'success', msg: 'Elemento agregado a la galería.' })
      setShowModal(false)
      setForm({ ...BLANK })
      loadItems()
    } catch (err: any) {
      setModalError(err.message ?? 'Error al guardar.')
    } finally {
      setSubmitting(false)
    }
  }

  async function togglePublicado(item: GaleriaItem) {
    setListAlert(null)
    setTogglingId(item.id_multimedia)
    try {
      await apiFetch(`/api/galeria/${item.id_multimedia}`, {
        method: 'PUT',
        body: JSON.stringify({ publicado: !item.publicado }),
      })
      setItems(prev => prev.map(x =>
        x.id_multimedia === item.id_multimedia ? { ...x, publicado: !x.publicado } : x
      ))
    } catch (err: any) {
      setListAlert({ type: 'error', msg: err.message ?? 'No se pudo cambiar el estado.' })
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(item: GaleriaItem) {
    if (!window.confirm('¿Eliminar este elemento de la galería permanentemente?')) return
    setListAlert(null)
    setDeletingId(item.id_multimedia)
    try {
      await apiFetch(`/api/galeria/${item.id_multimedia}`, { method: 'DELETE' })
      setItems(prev => prev.filter(x => x.id_multimedia !== item.id_multimedia))
      setListAlert({ type: 'success', msg: 'Elemento eliminado.' })
    } catch (err: any) {
      setListAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar.' })
    } finally {
      setDeletingId(null)
    }
  }

  function fmtFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const visible = typeFilter === 'todos' ? items : items.filter(i => i.tipo_archivo === typeFilter)

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Galería multimedia</h1>
        <p>Fotos y videos del club. Los elementos marcados como publicados son visibles en el portal.</p>
      </div>

      {listAlert && (
        <div className={`admin-alert ${listAlert.type}`} style={{ marginBottom: 16 }}>
          {listAlert.msg}
        </div>
      )}

      <div className="admin-card">
        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['todos', 'foto', 'video'] as const).map(f => (
              <button key={f} type="button" onClick={() => setTypeFilter(f)} style={{
                padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                borderColor: typeFilter === f ? 'var(--ucb-blue)' : 'var(--border-color)',
                background: typeFilter === f ? 'var(--ucb-blue)' : 'white',
                color: typeFilter === f ? 'white' : 'var(--text-light)',
              }}>
                {f === 'todos' ? 'Todos' : f === 'foto' ? 'Fotos' : 'Videos'}
              </button>
            ))}
          </div>
          <button type="button" className="admin-btn-primary" onClick={() => { setShowModal(true); setModalError(''); setForm({ ...BLANK }) }}>
            <Plus size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Agregar elemento
          </button>
        </div>

        {/* ── Table ── */}
        {listLoading ? (
          <p className="admin-empty">Cargando...</p>
        ) : visible.length === 0 ? (
          <p className="admin-empty">No hay elementos en la galería.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 72 }}>Vista</th>
                  <th>Tipo</th>
                  <th>URL</th>
                  <th>Publicado</th>
                  <th>Subido por</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(item => {
                  const isToggling = togglingId === item.id_multimedia
                  const isDeleting = deletingId === item.id_multimedia
                  return (
                    <tr key={item.id_multimedia}>
                      <td>
                        {item.tipo_archivo === 'foto' ? (
                          <div style={{ width: 56, height: 40, borderRadius: 6, overflow: 'hidden', background: '#f1f5f9' }}>
                            <img src={item.url_archivo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          </div>
                        ) : (
                          <div style={{ width: 56, height: 40, borderRadius: 6, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11 }}>
                            VID
                          </div>
                        )}
                      </td>
                      <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{item.tipo_archivo}</td>
                      <td style={{ maxWidth: 200 }}>
                        <a href={item.url_archivo} target="_blank" rel="noreferrer"
                          style={{ color: 'var(--ucb-blue)', fontSize: 12, wordBreak: 'break-all' }}>
                          {item.url_archivo.length > 50 ? `${item.url_archivo.slice(0, 50)}…` : item.url_archivo}
                        </a>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => togglePublicado(item)}
                          disabled={isToggling}
                          className={`admin-estado-toggle ${item.publicado ? 'activo' : 'inactivo'}`}
                          title={item.publicado ? 'Clic para ocultar' : 'Clic para publicar'}
                        >
                          {isToggling ? '…' : item.publicado ? 'Publicado' : 'Oculto'}
                        </button>
                      </td>
                      <td style={{ fontSize: 13 }}>{item.autor_nombres} {item.autor_apellido}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{fmtFecha(item.fecha_subida)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-icon-btn delete"
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
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

      {/* ── Add modal ── */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Agregar a la galería</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              {modalError && <div className="admin-alert error">{modalError}</div>}

              <div className="admin-field" style={{ maxWidth: 220 }}>
                <label>Tipo de archivo *</label>
                <select className="admin-select" value={form.tipo_archivo}
                  onChange={e => setForm(f => ({ ...f, tipo_archivo: e.target.value, url_archivo: '' }))}>
                  <option value="foto">Foto</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {form.tipo_archivo === 'foto' && (
                <div className="admin-field">
                  <label>Subir imagen</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button type="button" className="admin-btn-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <Upload size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      {uploading ? 'Subiendo…' : 'Elegir archivo'}
                    </button>
                    {form.url_archivo && <span style={{ fontSize: 12, color: '#16a34a' }}>✓ Subido</span>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
                </div>
              )}

              <div className="admin-field">
                <label>URL del archivo {form.tipo_archivo === 'video' ? '*' : '(o pegá una URL)'}</label>
                <input className="admin-input" value={form.url_archivo}
                  onChange={e => setForm(f => ({ ...f, url_archivo: e.target.value }))}
                  placeholder={form.tipo_archivo === 'video' ? 'https://...' : 'https://... (se llena automáticamente al subir)'}
                  required={form.tipo_archivo === 'video'}
                />
              </div>

              <div className="admin-field" style={{ maxWidth: 300 }}>
                <label>Torneo relacionado *</label>
                <select className="admin-select" value={form.id_torneo} required
                  onChange={e => setForm(f => ({ ...f, id_torneo: e.target.value, id_partido: '' }))}>
                  <option value="">Seleccionar torneo</option>
                  {torneos.map(t => <option key={t.id_torneo} value={t.id_torneo}>{t.nombre}</option>)}
                </select>
              </div>

              <div className="admin-field" style={{ maxWidth: 300 }}>
                <label>Partido relacionado *</label>
                <select className="admin-select" value={form.id_partido} required disabled={!form.id_torneo}
                  onChange={e => setForm(f => ({ ...f, id_partido: e.target.value }))}>
                  <option value="">Seleccionar partido</option>
                  {partidos.map(p => <option key={p.id_partido} value={p.id_partido}>{p.equipo_local} vs {p.equipo_visitante}</option>)}
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--ucb-blue)' }}>
                <input type="checkbox" checked={form.publicado} onChange={e => setForm(f => ({ ...f, publicado: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--ucb-blue)' }} />
                Publicar inmediatamente en el portal
              </label>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary" disabled={submitting || uploading}>
                  {submitting ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminGaleria
