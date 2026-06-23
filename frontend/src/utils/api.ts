export const API_BASE = 'https://deportes.62344037.xyz'

export function getToken(): string | null {
  return localStorage.getItem('ucb_token')
}

export function clearToken(): void {
  localStorage.removeItem('ucb_token')
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.error ?? body.message ?? message
    } catch {}
    throw new Error(message)
  }

  return res.json() as Promise<T>
}
