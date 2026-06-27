const BASE = "/api/noticias";

export interface Categoria {
  id_categoria_noticia: number;
  nombre: string;
}

export interface SaveDraftDTO {
  titulo: string;
  contenido: object;
  id_categoria_noticia: number;
}

export interface PublishDTO {
  titulo: string;
  contenido: object;
  id_categoria_noticia: number;
  resumen: string;
  imagenUrl: string | null;
}

export interface CreateNoticiaResponse {
  message:    string;
  id_noticia: number;
  contenido?: any; 
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("ucb_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `Error HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getCategorias(): Promise<Categoria[]> {
  const res = await fetch(`${BASE}/categorias`);
  return handleRes<Categoria[]>(res);
}

export async function uploadImagen(file: File): Promise<string> {
  const token = localStorage.getItem("ucb_token");
  const formData = new FormData();
  formData.append("imagen", file);

  const res = await fetch(`/api/upload/temp`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await handleRes<{ url: string }>(res);
  return data.url;
}

export async function uploadImagenPortada(file: File): Promise<string> {
  const token = localStorage.getItem("ucb_token");
  const formData = new FormData();
  formData.append("imagen", file);

  const res = await fetch(`/api/upload/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await handleRes<{ url: string }>(res);
  return data.url;
}

export async function createDraft(dto: SaveDraftDTO): Promise<CreateNoticiaResponse> {
  // Barra final para evitar el redirect del proxy (HTTPS -> HTTP) que bloquea el POST.
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo:               dto.titulo,
      contenido:            dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
      publicado:            false,
    }),
  });
  return handleRes<CreateNoticiaResponse>(res);
}

export async function updateDraft(
  id: number,
  dto: SaveDraftDTO,
): Promise<{ message: string; contenido: any }> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo:               dto.titulo,
      contenido:            dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
    }),
  });
  return handleRes<{ message: string; contenido: any }>(res);
}


export async function saveNoticia(
  dto: SaveDraftDTO,
  id?: number | null,
): Promise<{ id: number; contenido: any }> {
  if (id) {
    const response = await updateDraft(id, dto);
    return { id, contenido: response.contenido };
  }
  const response = await createDraft(dto);

  return { id: response.id_noticia, contenido: response.contenido };
}

/** PUT /api/noticias/:id — publica la noticia */
export async function publishNoticia(id: number, dto: PublishDTO): Promise<void> {
  const imagenes = dto.imagenUrl
    ? [{ url_storage: dto.imagenUrl, es_portada: true }]
    : [];

  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo:               dto.titulo,
      contenido:            dto.contenido,
      id_categoria_noticia: dto.id_categoria_noticia,
      resumen:              dto.resumen,
      publicado:            true,
      imagenes,
    }),
  });
  await handleRes<unknown>(res);
}