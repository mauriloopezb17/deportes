/* Login feature — own isolated network layer. No imports from other modules.
   Auth *state* is shared (contexts/AuthContext); the network calls are not. */
export const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const errBody = await res.json()
      message = errBody.error ?? errBody.message ?? message
    } catch {}
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) {
    let message = res.statusText
    try {
      const errBody = await res.json()
      message = errBody.error ?? errBody.message ?? message
    } catch {}
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export const login = (email: string, password: string) =>
  apiPost<{ token: string; user: any }>('/api/auth/login', { email, password })

/* Estado del 2FA de una cuenta. Se consulta tras validar la contraseña para
   saber si hay que pedir el código antes de dejar entrar. */
export const twofaStatus = (email: string) =>
  apiGet<{ email: string; dos_fa_activo: boolean }>(
    `/api/auth/2fa/status?email=${encodeURIComponent(email)}`,
  )

/* Verifica el código TOTP en el login. Si es válido, el backend devuelve un
   token de sesión nuevo (mismo shape que /auth/login). */
export const verify2FALogin = (email: string, codigo: string) =>
  apiPost<{ token: string; user: any }>('/api/auth/2fa/verificar', { email, codigo })

export const forgotPassword = (email: string) =>
  apiPost('/api/auth/forgot-password', { email })

export const verifyResetCode = (email: string, codigo: string) =>
  apiPost<{ valid: boolean; reset_token: string }>('/api/auth/verify-reset-code', { email, codigo })

export const resetPassword = (reset_token: string, nueva_password: string) =>
  apiPost('/api/auth/reset-password', { reset_token, nueva_password })

export const googleAuthUrl = () => `${API_BASE}/api/auth/google`

/* Where to land a user right after authenticating, based on their role.
   Roles in the backend `roles` table: 1=admin, 2=entrenador, 3=delegado, 4=jugador,
   5=marketing (CMS). The marketing role + its /noticiasAdmin route are pending
   migration, so that redirect stays dormant until both land.
   Matches on nombre_rol first (the stable contract with the backend) and falls back
   to id_rol, so it keeps working even if ids shift. */
export function panelPathForUser(u: { id_rol?: number; nombre_rol?: string | null }): string {
  const rol = (u.nombre_rol ?? '').toLowerCase()
  if (rol.includes('jugador') || u.id_rol === 4) return '/panel-finanzas'
  if (rol.includes('marketing') || u.id_rol === 5) return '/noticiasAdmin' // CMS (pendiente de migración)
  return '/'
}

/* El panel de gestión (grupo 2) es una app aparte servida bajo /gestion. Para
   admin/delegado/entrenador el back-office es ese panel, no el del portal (que
   quedó obsoleto). Devuelve la URL del panel, o null si el rol se queda en el portal. */
const PANEL_URL = (import.meta.env.VITE_PANEL_URL || '/gestion').replace(/\/+$/, '')

export function panelAppUrlForUser(u: { id_rol?: number; nombre_rol?: string | null }): string | null {
  const rol = (u.nombre_rol ?? '').toLowerCase()
  if (rol.includes('admin') || u.id_rol === 1) return `${PANEL_URL}/panel-admin`
  if (rol.includes('entrenador') || u.id_rol === 2) return `${PANEL_URL}/panel-entrenador`
  if (rol.includes('delegado') || u.id_rol === 3) return `${PANEL_URL}/panel-delegado`
  return null // jugador/marketing siguen en el portal
}

/* SSO best-effort hacia el panel: el panel lee 'token' y 'usuario' de localStorage
   (compartido cuando portal y panel están en el mismo origin del despliegue). Si su
   backend acepta el token, entra sin re-login; si no, el panel cae a su propio login. */
export function bridgeSessionToPanel(
  token: string,
  u: { id_usuario?: number; nombres?: string; ape_paterno?: string; email?: string; nombre_rol?: string | null },
): void {
  try {
    localStorage.setItem('token', token)
    localStorage.setItem(
      'usuario',
      JSON.stringify({
        id: u.id_usuario,
        nombre: u.nombres ?? '',
        apellido: u.ape_paterno ?? '',
        email: u.email ?? '',
        roles: [u.nombre_rol ?? ''],
      }),
    )
  } catch {
    /* localStorage no disponible */
  }
}
