/* Noticias (public view) feature — own isolated network layer.
   No imports from other modules. This is read-only public consumption; the news
   editor/CMS is a separate, untouched module. */
const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<T>
}

export interface Noticia {
  id_noticia: number
  titulo: string
  resumen: string | null
  categoria_nombre: string
  autor_nombre: string
  autor_apellido: string
  fecha_publicacion: string | null
  fecha_creacion: string
  imagen_portada: string | null
}

export interface Block {
  type: string
  data: any
}

export interface NoticiaDetalle {
  id_noticia: number
  titulo: string
  resumen: string | null
  contenido: { blocks: Block[] } | null
  categoria_nombre: string
  autor_nombre: string
  autor_apellido: string
  fecha_publicacion: string | null
  fecha_creacion: string
  imagenes: { url_storage: string; es_portada: boolean }[]
}

export const getNoticiasPublicadas = () =>
  apiGet<Noticia[]>('/api/noticias?publicado=true')
export const getNoticia = (id: string) =>
  apiGet<NoticiaDetalle>(`/api/noticias/${id}`)
