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

export const login = (email: string, password: string) =>
  apiPost<{ token: string; user: any }>('/api/auth/login', { email, password })

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
  if (rol.includes('admin') || u.id_rol === 1) return '/panel-admin'
  if (rol.includes('entrenador') || u.id_rol === 2) return '/panel-entrenador'
  if (rol.includes('delegado') || u.id_rol === 3) return '/panel-delegado'
  if (rol.includes('jugador') || u.id_rol === 4) return '/panel-finanzas'
  if (rol.includes('marketing') || u.id_rol === 5) return '/noticiasAdmin' // CMS (pendiente de migración)
  return '/'
}
