/* Galería feature — own isolated network layer. No imports from other modules. */
const API_BASE = 'https://deportes.62344037.xyz'

async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<T>
}

export interface GaleriaEvento {
  id_multimedia: number
  url_archivo: string
  tipo_archivo: string
  id_torneo: number | null
  id_partido: number | null
  fecha_subida: string
}

export const getGaleriaEventos = () =>
  apiGet<GaleriaEvento[]>('/api/info/galeria-eventos')
