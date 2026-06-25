/* Seguridad (2FA) feature — own isolated network layer, igual que login.
   Auth *state* se comparte (contexts/AuthContext); las llamadas de red no. */
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

export interface Generar2FAResponse {
  success: boolean
  message: string
  /** Imagen del QR en base64: "data:image/png;base64,..." */
  qrCode: string
}

/* POST /api/auth/2fa/generar — protegido por JWT (el token se adjunta solo).
   Devuelve el QR para escanear con una app de autenticación. */
export const generar2FA = () =>
  apiPost<Generar2FAResponse>('/api/auth/2fa/generar', {})
