/* Club feature — own isolated network layer. No imports from other modules. */
const API_BASE = 'https://deportes.62344037.xyz'

async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<T>
}

export interface EntrenadorRow {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  url_foto: string | null
  nombre_disciplina: string
  nombre_categoria: string
}

export interface Horario {
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  nombre_disciplina: string
  nombre_espacio: string
  entrenador_nombres: string | null
  entrenador_apellido: string | null
}

export interface JugadorDestacado {
  id_deportista: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  url_foto: string | null
  nombre_disciplina: string
  nombre_categoria: string | null
}

export const getHorarios = () => apiGet<Horario[]>('/api/info/horarios')
export const getEntrenadores = () => apiGet<EntrenadorRow[]>('/api/info/entrenadores')
export const getJugadoresDestacados = () =>
  apiGet<JugadorDestacado[]>('/api/deportistas/destacados')
