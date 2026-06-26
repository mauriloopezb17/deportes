import { apiClient } from "@/services/api";

// Capa de red para la galeria multimedia. Apunta a los mismos endpoints que el
// panel anterior: /api/partidos/*, /api/upload y /api/galeria/.

export interface TorneoOption {
  id_torneo: number;
  nombre: string;
}

export interface PartidoOption {
  id_partido: number;
  equipo_local: string;
  equipo_visitante: string;
}

export interface CrearMultimediaPayload {
  url_archivo: string;
  tipo_archivo: string;
  publicado: boolean;
  id_torneo: number | null;
  id_partido: number | null;
}

export const galeriaService = {
  async obtenerTorneos(): Promise<TorneoOption[]> {
    const response = await apiClient.get<TorneoOption[]>("/partidos/torneos");
    return response.data || [];
  },

  async obtenerPartidos(idTorneo: number): Promise<PartidoOption[]> {
    const response = await apiClient.get<PartidoOption[]>(
      `/partidos/torneo/${idTorneo}`,
    );
    return response.data || [];
  },

  async subirArchivo(file: File): Promise<string> {
    const response = await apiClient.uploadFile<{ url: string }>(
      "/upload",
      file,
    );
    return response.data?.url ?? "";
  },

  async crearMultimedia(payload: CrearMultimediaPayload): Promise<void> {
    await apiClient.post("/galeria/", payload);
  },
};
