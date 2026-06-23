import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { apiFetch } from '../services/adminService'
import './Admin.css'

interface Rol     { id_rol: number; nombre_rol: string; descripcion: string }
interface Carrera { id_carrera: number; nombre: string; sigla: string }

interface FormState {
  nombres: string
  ape_paterno: string
  ape_materno: string
  fecha_nacimiento: string
  celular: string
  ci: string
  complemento: string
  email: string
  id_rol: string
  id_carrera: string
  gestion: string
}

const EMPTY: FormState = {
  nombres: '', ape_paterno: '', ape_materno: '',
  fecha_nacimiento: '', celular: '', ci: '', complemento: '',
  email: '', id_rol: '', id_carrera: '', gestion: '',
}

function RegistrarUsuario() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]         = useState<FormState>(EMPTY)
  const [roles, setRoles]       = useState<Rol[]>([])
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [submitting, setLoading]   = useState(false)
  const [alert, setAlert]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin)          { navigate('/', { replace: true }); return }
    Promise.all([
      apiFetch<Rol[]>('/api/admin/roles'),
      apiFetch<Carrera[]>('/api/admin/carreras'),
    ]).then(([r, c]) => { setRoles(r); setCarreras(c) })
      .catch(() => setAlert({ type: 'error', msg: 'No se pudieron cargar los datos del formulario.' }))
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  const staffRoles = roles.filter(r => r.nombre_rol?.toLowerCase() !== 'jugador')
  const selectedRol = roles.find(r => r.id_rol === parseInt(form.id_rol, 10))
  const isDelegado  = selectedRol?.nombre_rol?.toLowerCase().includes('delegado') ?? false

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAlert(null)
    setLoading(true)
    try {
      await apiFetch('/api/admin/usuarios/registrar', {
        method: 'POST',
        body: JSON.stringify({
          nombres:          form.nombres.trim(),
          ape_paterno:      form.ape_paterno.trim(),
          ape_materno:      form.ape_materno.trim(),
          fecha_nacimiento: form.fecha_nacimiento,
          celular:          form.celular.trim(),
          ci:               form.ci.trim(),
          complemento:      form.complemento.trim() || null,
          email:            form.email.trim(),
          id_rol:           parseInt(form.id_rol, 10),
          ...(isDelegado && {
            id_carrera: parseInt(form.id_carrera, 10),
            gestion:    form.gestion.trim(),
          }),
        }),
      })
      setAlert({ type: 'success', msg: 'Usuario registrado. La contraseña inicial es su número de CI.' })
      setForm(EMPTY)
    } catch (err: any) {
      setAlert({ type: 'error', msg: err.message ?? 'Error al registrar el usuario.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Registrar Usuario</h1>
        <p>Crear cuentas para miembros del cuerpo técnico, delegados y administradores. Los deportistas se registran desde "Inscribir Deportista". La contraseña inicial será el número de CI del usuario.</p>
      </div>

      <div className="admin-card">
        {alert && <div className={`admin-alert ${alert.type}`} style={{ marginBottom: 20 }}>{alert.msg}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>

          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="nombres">Nombres *</label>
              <input id="nombres" className="admin-input" value={form.nombres} onChange={set('nombres')} required />
            </div>
            <div className="admin-field">
              <label htmlFor="ape_paterno">Apellido paterno *</label>
              <input id="ape_paterno" className="admin-input" value={form.ape_paterno} onChange={set('ape_paterno')} required />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="ape_materno">Apellido materno</label>
              <input id="ape_materno" className="admin-input" value={form.ape_materno} onChange={set('ape_materno')} />
            </div>
            <div className="admin-field">
              <label htmlFor="fecha_nacimiento">Fecha de nacimiento *</label>
              <input id="fecha_nacimiento" type="date" className="admin-input" value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')} required />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="ci">Carnet de identidad *</label>
              <input id="ci" className="admin-input" placeholder="Ej: 12345678" value={form.ci} onChange={set('ci')} required />
            </div>
            <div className="admin-field">
              <label htmlFor="complemento">Complemento CI</label>
              <input id="complemento" className="admin-input" placeholder="Ej: 1A" value={form.complemento} onChange={set('complemento')} />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="celular">Celular *</label>
              <input id="celular" className="admin-input" placeholder="+591 XXXXXXXX" value={form.celular} onChange={set('celular')} required />
            </div>
            <div className="admin-field">
              <label htmlFor="email">Correo electrónico *</label>
              <input id="email" type="email" className="admin-input" value={form.email} onChange={set('email')} required />
            </div>
          </div>

          <div className="admin-field" style={{ maxWidth: 260 }}>
            <label htmlFor="id_rol">Rol *</label>
            <select id="id_rol" className="admin-select" value={form.id_rol} onChange={set('id_rol')} required>
              <option value="">Seleccionar rol...</option>
              {staffRoles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
              ))}
            </select>
          </div>

          {isDelegado && (
            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="id_carrera">Carrera *</label>
                <select id="id_carrera" className="admin-select" value={form.id_carrera} onChange={set('id_carrera')} required>
                  <option value="">Seleccionar carrera...</option>
                  {carreras.map(c => (
                    <option key={c.id_carrera} value={c.id_carrera}>{c.nombre} ({c.sigla})</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="gestion">Gestión *</label>
                <input id="gestion" className="admin-input" placeholder="Ej: 2024-1" value={form.gestion} onChange={set('gestion')} required />
              </div>
            </div>
          )}

          <button type="submit" className="admin-btn-primary" disabled={submitting || staffRoles.length === 0}>
            {submitting ? 'Registrando...' : 'Registrar usuario'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegistrarUsuario
