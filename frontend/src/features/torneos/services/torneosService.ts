/* Torneos feature — own isolated network layer. No imports from other modules. */
const API_BASE = 'https://deportes.62344037.xyz'

async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<T>
}

export interface Torneo {
  id_torneo: number
  nombre: string
  id_disciplina: number
}

export interface Disciplina {
  id_disciplina: number
  nombre_disciplina: string
}

export interface PosicionRow {
  id_equipo: number
  nombre_equipo: string
  pj: number; pg: number; pe: number; pp: number
  gf: number; gc: number; dg: number; pts: number
}

export interface Partido {
  id_partido: number
  fecha: string
  hora_inicio: string
  goles_local: number | null
  goles_visitante: number | null
  estado: string
  fase_torneo: string | null
  equipo_local: string
  equipo_visitante: string
  espacio: string | null
  torneo_nombre: string
  nombre_disciplina: string | null
}

export interface Goleador {
  id_deportista: number
  jugador: string
  equipo: string
  goles: number
}

export interface TarjetaRow {
  id_equipo: number
  equipo: string
  amarillas: number
  rojas: number
}

export const getTorneos = () => apiGet<Torneo[]>('/api/partidos/torneos')
export const getDisciplinas = () => apiGet<Disciplina[]>('/api/partidos/disciplinas')
export const getPosiciones = (idTorneo: number) =>
  apiGet<PosicionRow[]>(`/api/partidos/posiciones/${idTorneo}`)
export const getPartidosTorneo = (idTorneo: number) =>
  apiGet<Partido[]>(`/api/partidos/torneo/${idTorneo}`)
export const getGoleadores = (idTorneo: number) =>
  apiGet<Goleador[]>(`/api/partidos/goleadores/${idTorneo}`)
export const getTarjetas = (idTorneo: number) =>
  apiGet<TarjetaRow[]>(`/api/partidos/tarjetas/${idTorneo}`)
export const getFixture = (idTorneo: number) =>
  apiGet<Partido[]>(`/api/partidos/fixture/${idTorneo}`)
