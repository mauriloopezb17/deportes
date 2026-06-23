/* Home feature — own isolated network layer. No imports from other modules. */
const API_BASE = 'https://deportes.62344037.xyz'

async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<T>
}

export interface JugadorDestacado {
  id_deportista: number
  nombres: string
  ape_paterno: string
  url_foto: string | null
  nombre_disciplina: string
  nombre_categoria: string | null
}

export interface Noticia {
  id_noticia: number
  titulo: string
  resumen: string | null
  categoria_nombre: string
  imagen_portada: string | null
  fecha_publicacion: string | null
  fecha_creacion: string
}

export interface Resultado {
  id_partido: number
  fecha: string
  hora_inicio: string
  equipo_local: string
  equipo_visitante: string
  goles_local: number
  goles_visitante: number
  disciplina: string
  torneo_nombre: string
}

export interface ProximoPartido {
  id_partido: number
  fecha: string
  hora_inicio: string
  equipo_local: string
  equipo_visitante: string
  torneo_nombre: string
  espacio: string | null
}

export const getNoticiasPublicadas = () =>
  apiGet<Noticia[]>('/api/noticias?publicado=true')
export const getResultadosRecientes = () =>
  apiGet<Resultado[]>('/api/partidos/recientes')
export const getProximosPartidos = () =>
  apiGet<ProximoPartido[]>('/api/partidos/proximos')
export const getDeportistasDestacados = () =>
  apiGet<JugadorDestacado[]>('/api/deportistas/destacados')
