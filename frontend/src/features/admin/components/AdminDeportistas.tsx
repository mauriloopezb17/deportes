import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { apiFetch } from '../services/adminService'
import './Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Disciplina { id_disciplina: number; nombre_disciplina: string }
interface Categoria  { id_categoria:  number; nombre_categoria:  string }
interface Catalogs   { disciplinas: Disciplina[]; categorias: Categoria[] }
interface Rol        { id_rol: number; nombre_rol: string; descripcion: string }

interface Deportista {
  id_deportista: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  ci: string
  complemento: string | null
  celular: string
  tipo_deportista: string
  talla_ropa: string | null
  fecha_inscripcion: string | null
  estado_inscripcion: string | null
  nombre_disciplina: string | null
  nombre_categoria: string | null
}

interface Experiencia {
  tipo_participacion: string
  gestion: string
  club_sede: string
  categoria_jugada: string
}

// ── Blank form states ─────────────────────────────────────────────────────────

const BLANK_DEP = {
  nombres: '', ape_paterno: '', ape_materno: '',
  fecha_nacimiento: '', ci: '', complemento: '',
  celular: '', email: '', talla_ropa: '',
  colegio_instituto: '', curso: '',
}

const BLANK_INS = { id_disciplina: '', id_categoria: '' }

const BLANK_TUT = {
  nombres: '', ape_paterno: '', ape_materno: '',
  fecha_nacimiento: '', ci: '', complemento: '',
  celular: '', email: '', id_rol: '',
}

const BLANK_MED = {
  tipo_sangre: '', seguro_medico: '',
  enfermedades_padecimientos: '',
  contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
}

const BLANK_EXP: Experiencia = { tipo_participacion: '', gestion: '', club_sede: '', categoria_jugada: '' }

// ── Helper ────────────────────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

function AdminDeportistas() {
  const { isAdmin, isAuthenticated, loading } = useAuth()
  const navigate      = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'lista'

  // ── Shared state
  const [catalogs, setCatalogs]     = useState<Catalogs>({ disciplinas: [], categorias: [] })
  const [roles, setRoles]           = useState<Rol[]>([])
  const [deportistas, setDeportistas] = useState<Deportista[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError]     = useState('')

  // ── Form state
  const [dep, setDep] = useState({ ...BLANK_DEP })
  const [ins, setIns] = useState({ ...BLANK_INS })
  const [hasTutor, setHasTutor] = useState(false)
  const [tut, setTut] = useState({ ...BLANK_TUT })
  const [hasMed, setHasMed]     = useState(false)
  const [med, setMed] = useState({ ...BLANK_MED })
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [formAlert, setFormAlert]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [catalogError, setCatalogError] = useState('')

  // ── List actions state
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [listAlert, setListAlert]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [filtroDisciplina, setFiltroDisciplina] = useState('Todas')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroGestion, setFiltroGestion] = useState('Todas')

  const [editing, setEditing]       = useState<Deportista | null>(null)
  const [editForm, setEditForm]     = useState({
    nombres: '', ape_paterno: '', ape_materno: '', celular: '', talla_ropa: '',
  })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError]   = useState('')

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin)          { navigate('/', { replace: true }); return }

    apiFetch<Catalogs>('/api/admin/catalogos/inscripcion')
      .then(setCatalogs)
      .catch((err: any) => setCatalogError(err.message ?? 'Error al cargar disciplinas y categorías.'))

    apiFetch<Rol[]>('/api/admin/roles')
      .then(setRoles)
      .catch(() => {})

    loadDeportistas()
  }, [loading, isAuthenticated, isAdmin, navigate])

  function loadDeportistas() {
    setListLoading(true)
    apiFetch<Deportista[]>('/api/admin/deportistas')
      .then(setDeportistas)
      .catch(() => setListError('No se pudo cargar la lista.'))
      .finally(() => setListLoading(false))
  }

  function isActivo(estado: string | null) {
    return estado === 'Activo'
  }

  function nextEstadoLabel(estado: string | null) {
    if (estado === 'Activo') return 'Abandono'
    if (estado === 'Abandono') return 'Desactivado'
    return 'Activo'
  }

  async function toggleEstado(d: Deportista) {
    setListAlert(null)
    setTogglingId(d.id_deportista)
    try {
      const data = await apiFetch<{ nuevo_estado: string }>(
        `/api/admin/deportistas/${d.id_deportista}/estado`,
        { method: 'PATCH' }
      )
      setDeportistas(prev =>
        prev.map(x => x.id_deportista === d.id_deportista
          ? { ...x, estado_inscripcion: data.nuevo_estado }
          : x)
      )
    } catch (err: any) {
      setListAlert({ type: 'error', msg: err.message ?? 'No se pudo cambiar el estado.' })
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(d: Deportista) {
    const nombreCompleto = `${d.nombres} ${d.ape_paterno}`.trim()
    if (!window.confirm(`¿Eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`)) return
    setListAlert(null)
    setDeletingId(d.id_deportista)
    try {
      await apiFetch(`/api/admin/deportistas/${d.id_deportista}`, { method: 'DELETE' })
      setDeportistas(prev => prev.filter(x => x.id_deportista !== d.id_deportista))
      setListAlert({ type: 'success', msg: `${nombreCompleto} fue eliminado.` })
    } catch (err: any) {
      setListAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar al deportista.' })
    } finally {
      setDeletingId(null)
    }
  }

  function openEdit(d: Deportista) {
    setEditing(d)
    setEditError('')
    setEditForm({
      nombres:     d.nombres ?? '',
      ape_paterno: d.ape_paterno ?? '',
      ape_materno: d.ape_materno ?? '',
      celular:     d.celular ?? '',
      talla_ropa:  d.talla_ropa ?? '',
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
      await apiFetch(`/api/admin/deportistas/${editing.id_deportista}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombres:     editForm.nombres.trim(),
          ape_paterno: editForm.ape_paterno.trim(),
          ape_materno: editForm.ape_materno.trim() || null,
          celular:     editForm.celular.trim(),
          talla_ropa:  editForm.talla_ropa || null,
        }),
      })
      setDeportistas(prev =>
        prev.map(x => x.id_deportista === editing.id_deportista
          ? { ...x, ...editForm, ape_materno: editForm.ape_materno || null, talla_ropa: editForm.talla_ropa || null }
          : x)
      )
      setListAlert({ type: 'success', msg: 'Deportista actualizado.' })
      closeEdit()
    } catch (err: any) {
      setEditError(err.message ?? 'No se pudo actualizar al deportista.')
    } finally {
      setEditSubmitting(false)
    }
  }

  // ── Generic field setter helpers
  const setField = (setter: React.Dispatch<React.SetStateAction<any>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))

  const setExp = (i: number, field: keyof Experiencia) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setExperiencias(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: e.target.value } : x))
    }

  // ── Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormAlert(null)
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/deportistas/inscribir', {
        method: 'POST',
        body: JSON.stringify({
          deportista: {
            ...dep,
            ci:          dep.ci.trim(),
            complemento: dep.complemento.trim() || undefined,
          },
          inscripcion: {
            id_disciplina: parseInt(ins.id_disciplina, 10),
            id_categoria:  parseInt(ins.id_categoria,  10),
          },
          ...(hasTutor && tut.nombres.trim() && {
            tutor: {
              ...tut,
              complemento: tut.complemento.trim() || undefined,
              id_rol: tut.id_rol ? parseInt(tut.id_rol, 10) : undefined,
            },
          }),
          ...(hasMed && med.tipo_sangre.trim() && { ficha_medica: med }),
          ...(experiencias.length > 0 && { experiencias }),
        }),
      })
      setFormAlert({ type: 'success', msg: 'Deportista inscrito correctamente.' })
      setDep({ ...BLANK_DEP })
      setIns({ ...BLANK_INS })
      setTut({ ...BLANK_TUT })
      setMed({ ...BLANK_MED })
      setExperiencias([])
      setHasTutor(false)
      setHasMed(false)
      loadDeportistas()
    } catch (err: any) {
      setFormAlert({ type: 'error', msg: err.message ?? 'Error al inscribir deportista.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const disciplinasUnicas = Array.from(new Set(deportistas.map(d => d.nombre_disciplina).filter(Boolean))) as string[];
  const categoriasUnicas = Array.from(new Set(deportistas.map(d => d.nombre_categoria).filter(Boolean))) as string[];
  const tiposUnicos = Array.from(new Set(deportistas.map(d => d.tipo_deportista).filter(Boolean))) as string[];
  const gestionesUnicas = Array.from(new Set(deportistas.map(d => d.fecha_inscripcion ? new Date(d.fecha_inscripcion).getFullYear().toString() : '').filter(Boolean))).sort() as string[];

  const deportistasFiltrados = deportistas.filter(d => {
    const matchDisciplina = filtroDisciplina === 'Todas' || d.nombre_disciplina === filtroDisciplina;
    const matchCategoria = filtroCategoria === 'Todas' || d.nombre_categoria === filtroCategoria;
    const matchTipo = filtroTipo === 'Todos' || d.tipo_deportista === filtroTipo;
    const gestion = d.fecha_inscripcion ? new Date(d.fecha_inscripcion).getFullYear().toString() : '';
    const matchGestion = filtroGestion === 'Todas' || gestion === filtroGestion;
    return matchDisciplina && matchCategoria && matchTipo && matchGestion;
  });

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Deportistas</h1>
        <p>Listado e inscripción de deportistas en el sistema.</p>
      </div>

      {/* ── Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'lista' ? ' active' : ''}`}
          onClick={() => setParams({ tab: 'lista' })}
        >
          Lista
        </button>
        <button
          className={`admin-tab${tab === 'inscribir' ? ' active' : ''}`}
          onClick={() => setParams({ tab: 'inscribir' })}
        >
          Inscribir deportista
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
          {listLoading && <p className="admin-empty">Cargando...</p>}
          {listError   && <p className="admin-empty" style={{ color: '#dc2626' }}>{listError}</p>}
          
          {!listLoading && !listError && deportistas.length > 0 && (
            <div className="admin-filters" style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div className="admin-field" style={{ flex: '1 1 150px' }}>
                <label>Disciplina</label>
                <select className="admin-select" value={filtroDisciplina} onChange={e => setFiltroDisciplina(e.target.value)}>
                  <option value="Todas">Todas</option>
                  {disciplinasUnicas.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="admin-field" style={{ flex: '1 1 150px' }}>
                <label>Categoría</label>
                <select className="admin-select" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                  <option value="Todas">Todas</option>
                  {categoriasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-field" style={{ flex: '1 1 150px' }}>
                <label>Tipo</label>
                <select className="admin-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="admin-field" style={{ flex: '1 1 150px' }}>
                <label>Gestión</label>
                <select className="admin-select" value={filtroGestion} onChange={e => setFiltroGestion(e.target.value)}>
                  <option value="Todas">Todas</option>
                  {gestionesUnicas.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          )}

          {!listLoading && !listError && deportistas.length === 0 && (
            <p className="admin-empty">No hay deportistas registrados aún.</p>
          )}
          {!listLoading && !listError && deportistas.length > 0 && deportistasFiltrados.length === 0 && (
            <p className="admin-empty">No hay deportistas que coincidan con los filtros.</p>
          )}
          {!listLoading && deportistasFiltrados.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre completo</th>
                    <th>CI</th>
                    <th>Disciplina</th>
                    <th>Categoría</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Inscrito</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deportistasFiltrados.map(d => {
                    const activo = isActivo(d.estado_inscripcion)
                    const isToggling = togglingId === d.id_deportista
                    const isDeleting = deletingId === d.id_deportista
                    return (
                      <tr key={d.id_deportista}>
                        <td style={{ fontWeight: 600 }}>
                          {d.nombres} {d.ape_paterno}{d.ape_materno ? ` ${d.ape_materno}` : ''}
                        </td>
                        <td>{d.ci}{d.complemento ? `-${d.complemento}` : ''}</td>
                        <td>{d.nombre_disciplina ?? '—'}</td>
                        <td>{d.nombre_categoria  ?? '—'}</td>
                        <td>{d.tipo_deportista}</td>
                        <td>
                          {d.estado_inscripcion ? (
                            <button
                              type="button"
                              onClick={() => toggleEstado(d)}
                              disabled={isToggling}
                              className={`admin-estado-toggle ${activo ? 'activo' : 'inactivo'}`}
                              title={`Siguiente: ${nextEstadoLabel(d.estado_inscripcion)}`}
                            >
                              {isToggling ? '...' : d.estado_inscripcion}
                            </button>
                          ) : '—'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{fmt(d.fecha_inscripcion)}</td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-icon-btn edit"
                            onClick={() => openEdit(d)}
                            title="Editar deportista"
                            disabled={isDeleting}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn delete"
                            onClick={() => handleDelete(d)}
                            disabled={isDeleting}
                            title="Eliminar deportista"
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
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Editar deportista</h2>
              <button type="button" className="admin-modal-close" onClick={closeEdit}>
                <X size={18} />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleEditSubmit}>
              {editError && <div className="admin-alert error">{editError}</div>}

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Nombres *</label>
                  <input
                    className="admin-input"
                    value={editForm.nombres}
                    onChange={e => setEditForm(f => ({ ...f, nombres: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label>Apellido paterno *</label>
                  <input
                    className="admin-input"
                    value={editForm.ape_paterno}
                    onChange={e => setEditForm(f => ({ ...f, ape_paterno: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Apellido materno</label>
                  <input
                    className="admin-input"
                    value={editForm.ape_materno}
                    onChange={e => setEditForm(f => ({ ...f, ape_materno: e.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label>Celular *</label>
                  <input
                    className="admin-input"
                    value={editForm.celular}
                    onChange={e => setEditForm(f => ({ ...f, celular: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="admin-field" style={{ maxWidth: 200 }}>
                <label>Talla de ropa</label>
                <select
                  className="admin-select"
                  value={editForm.talla_ropa}
                  onChange={e => setEditForm(f => ({ ...f, talla_ropa: e.target.value }))}
                >
                  <option value="">—</option>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

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

      {/* ── Inscribir ── */}
      {tab === 'inscribir' && (
        <div className="admin-card">
          {formAlert && (
            <div className={`admin-alert ${formAlert.type}`} style={{ marginBottom: 24 }}>
              {formAlert.msg}
            </div>
          )}

          <form className="admin-form" style={{ maxWidth: 640 }} onSubmit={handleSubmit}>

            {/* ── Sección 1: Deportista */}
            <p className="admin-section-title">Datos del deportista</p>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Nombres *</label>
                <input name="nombres" className="admin-input" value={dep.nombres} onChange={setField(setDep)} required />
              </div>
              <div className="admin-field">
                <label>Apellido paterno *</label>
                <input name="ape_paterno" className="admin-input" value={dep.ape_paterno} onChange={setField(setDep)} required />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Apellido materno</label>
                <input name="ape_materno" className="admin-input" value={dep.ape_materno} onChange={setField(setDep)} />
              </div>
              <div className="admin-field">
                <label>Fecha de nacimiento *</label>
                <input name="fecha_nacimiento" type="date" className="admin-input" value={dep.fecha_nacimiento} onChange={setField(setDep)} required />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>CI *</label>
                <input name="ci" className="admin-input" value={dep.ci} onChange={setField(setDep)} required />
              </div>
              <div className="admin-field">
                <label>Complemento CI</label>
                <input name="complemento" className="admin-input" placeholder="Ej: 1A" value={dep.complemento} onChange={setField(setDep)} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Celular *</label>
                <input name="celular" className="admin-input" value={dep.celular} onChange={setField(setDep)} required />
              </div>
              <div className="admin-field">
                <label>Correo electrónico *</label>
                <input name="email" type="email" className="admin-input" value={dep.email} onChange={setField(setDep)} required />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Colegio / Instituto *</label>
                <input name="colegio_instituto" className="admin-input" value={dep.colegio_instituto} onChange={setField(setDep)} required />
              </div>
              <div className="admin-field">
                <label>Curso *</label>
                <input name="curso" className="admin-input" placeholder="Ej: 6to de Secundaria" value={dep.curso} onChange={setField(setDep)} required />
              </div>
            </div>

            <div className="admin-field" style={{ maxWidth: 200 }}>
              <label>Talla de ropa</label>
              <select name="talla_ropa" className="admin-select" value={dep.talla_ropa} onChange={setField(setDep)}>
                <option value="">—</option>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* ── Sección 2: Inscripción */}
            <p className="admin-section-title" style={{ marginTop: 28 }}>Inscripción</p>
            {catalogError && (
              <div className="admin-alert error" style={{ marginBottom: 12 }}>{catalogError}</div>
            )}

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Disciplina *</label>
                <select name="id_disciplina" className="admin-select" value={ins.id_disciplina} onChange={setField(setIns)} required>
                  <option value="">Seleccionar...</option>
                  {catalogs.disciplinas.map(d => (
                    <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre_disciplina}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Categoría *</label>
                <select name="id_categoria" className="admin-select" value={ins.id_categoria} onChange={setField(setIns)} required>
                  <option value="">Seleccionar...</option>
                  {catalogs.categorias.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Sección 3: Tutor (opcional) */}
            <div className="admin-optional-toggle" onClick={() => setHasTutor(h => !h)}>
              <span className="admin-toggle-icon">{hasTutor ? '▾' : '▸'}</span>
              Tutor / Apoderado <span className="admin-optional-label">opcional</span>
            </div>

            {hasTutor && (
              <>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Nombres *</label>
                    <input name="nombres" className="admin-input" value={tut.nombres} onChange={setField(setTut)} />
                  </div>
                  <div className="admin-field">
                    <label>Apellido paterno *</label>
                    <input name="ape_paterno" className="admin-input" value={tut.ape_paterno} onChange={setField(setTut)} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Apellido materno</label>
                    <input name="ape_materno" className="admin-input" value={tut.ape_materno} onChange={setField(setTut)} />
                  </div>
                  <div className="admin-field">
                    <label>Fecha de nacimiento</label>
                    <input name="fecha_nacimiento" type="date" className="admin-input" value={tut.fecha_nacimiento} onChange={setField(setTut)} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>CI</label>
                    <input name="ci" className="admin-input" value={tut.ci} onChange={setField(setTut)} />
                  </div>
                  <div className="admin-field">
                    <label>Complemento CI</label>
                    <input name="complemento" className="admin-input" value={tut.complemento} onChange={setField(setTut)} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Celular</label>
                    <input name="celular" className="admin-input" value={tut.celular} onChange={setField(setTut)} />
                  </div>
                  <div className="admin-field">
                    <label>Correo (opcional)</label>
                    <input name="email" type="email" className="admin-input" value={tut.email} onChange={setField(setTut)} />
                  </div>
                </div>
                <div className="admin-field" style={{ maxWidth: 260 }}>
                  <label>Rol del tutor</label>
                  <select name="id_rol" className="admin-select" value={tut.id_rol} onChange={setField(setTut)}>
                    <option value="">Seleccionar rol...</option>
                    {roles.map(r => (
                      <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* ── Sección 4: Ficha médica (opcional) */}
            <div className="admin-optional-toggle" onClick={() => setHasMed(h => !h)}>
              <span className="admin-toggle-icon">{hasMed ? '▾' : '▸'}</span>
              Ficha médica <span className="admin-optional-label">opcional</span>
            </div>

            {hasMed && (
              <>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Tipo de sangre</label>
                    <select name="tipo_sangre" className="admin-select" value={med.tipo_sangre} onChange={setField(setMed)}>
                      <option value="">—</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Seguro médico</label>
                    <input name="seguro_medico" className="admin-input" value={med.seguro_medico} onChange={setField(setMed)} />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Enfermedades / padecimientos</label>
                  <input name="enfermedades_padecimientos" className="admin-input" value={med.enfermedades_padecimientos} onChange={setField(setMed)} />
                </div>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Contacto de emergencia</label>
                    <input name="contacto_emergencia_nombre" className="admin-input" value={med.contacto_emergencia_nombre} onChange={setField(setMed)} />
                  </div>
                  <div className="admin-field">
                    <label>Teléfono de emergencia</label>
                    <input name="contacto_emergencia_telefono" className="admin-input" value={med.contacto_emergencia_telefono} onChange={setField(setMed)} />
                  </div>
                </div>
              </>
            )}

            {/* ── Sección 5: Experiencias previas (opcional) */}
            <div className="admin-optional-toggle" onClick={() => setExperiencias(e => e.length ? [] : [{ ...BLANK_EXP }])}>
              <span className="admin-toggle-icon">{experiencias.length ? '▾' : '▸'}</span>
              Experiencia deportiva previa <span className="admin-optional-label">opcional</span>
            </div>

            {experiencias.length > 0 && (
              <>
                {experiencias.map((exp, i) => (
                  <div key={i} className="admin-exp-row">
                    <div className="admin-form-row">
                      <div className="admin-field">
                        <label>Tipo de participación</label>
                        <input className="admin-input" value={exp.tipo_participacion} onChange={setExp(i, 'tipo_participacion')} placeholder="Ej: Competencia" />
                      </div>
                      <div className="admin-field">
                        <label>Gestión</label>
                        <input className="admin-input" value={exp.gestion} onChange={setExp(i, 'gestion')} placeholder="Ej: 2023" />
                      </div>
                    </div>
                    <div className="admin-form-row">
                      <div className="admin-field">
                        <label>Club / Sede</label>
                        <input className="admin-input" value={exp.club_sede} onChange={setExp(i, 'club_sede')} />
                      </div>
                      <div className="admin-field">
                        <label>Categoría jugada</label>
                        <input className="admin-input" value={exp.categoria_jugada} onChange={setExp(i, 'categoria_jugada')} />
                      </div>
                    </div>
                    <button type="button" className="admin-exp-remove" onClick={() => setExperiencias(e => e.filter((_, idx) => idx !== i))}>
                      Eliminar
                    </button>
                  </div>
                ))}
                <button type="button" className="admin-exp-add" onClick={() => setExperiencias(e => [...e, { ...BLANK_EXP }])}>
                  + Agregar otra experiencia
                </button>
              </>
            )}

            <div style={{ marginTop: 28 }}>
              <button type="submit" className="admin-btn-primary" disabled={submitting}>
                {submitting ? 'Inscribiendo...' : 'Inscribir deportista'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminDeportistas
