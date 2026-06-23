/* Login feature — own isolated network layer. No imports from other modules.
   Auth *state* is shared (contexts/AuthContext); the network calls are not. */
export const API_BASE = 'https://deportes.62344037.xyz'

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
   Role ids (per backend): 1=Administrador, 2=Entrenador, 3=Delegado, 4=Deportista.
   Matches on id_rol with a nombre_rol fallback so it stays correct even if ids shift. */
export function panelPathForUser(u: { id_rol?: number; nombre_rol?: string | null }): string {
  const rol = (u.nombre_rol ?? '').toLowerCase()
  if (u.id_rol === 1 || rol.includes('admin')) return '/admin'
  if (u.id_rol === 4 || rol.includes('deportista')) return '/panel-finanzas'
  if (u.id_rol === 3 || rol.includes('delegado')) return '/panel-delegado'
  if (u.id_rol === 2 || rol.includes('entrenador')) return '/panel-entrenador'
  return '/'
}
