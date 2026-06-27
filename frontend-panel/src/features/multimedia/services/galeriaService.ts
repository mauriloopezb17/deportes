import { apiClient } from "@/services/api";
import { demoPartidos, demoTorneos, isDemoMode } from "@/data/demoData";

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
    if (isDemoMode) {
      return demoTorneos.map((torneo) => ({
        id_torneo: torneo.id,
        nombre: torneo.nombre,
      }));
    }

    try {
      const response = await apiClient.get<TorneoOption[]>("/partidos/torneos");
      return response.data?.length
        ? response.data
        : demoTorneos.map((torneo) => ({
            id_torneo: torneo.id,
            nombre: torneo.nombre,
          }));
    } catch {
      return demoTorneos.map((torneo) => ({
        id_torneo: torneo.id,
        nombre: torneo.nombre,
      }));
    }
  },

  async obtenerPartidos(idTorneo: number): Promise<PartidoOption[]> {
    if (isDemoMode) {
      return demoPartidos
        .filter((partido) => partido.torneo.id === idTorneo)
        .map((partido) => ({
          id_partido: partido.id,
          equipo_local: partido.equipo_local.nombre,
          equipo_visitante: partido.equipo_visitante.nombre,
        }));
    }

    try {
      const response = await apiClient.get<PartidoOption[]>(
        `/partidos/torneo/${idTorneo}`,
      );
      if (response.data?.length) return response.data;
    } catch {
      // El alta de galería permanece conectada al backend; solo las opciones
      // de lectura usan datos de demostración cuando el servicio no responde.
    }

    return demoPartidos
      .filter((partido) => partido.torneo.id === idTorneo)
      .map((partido) => ({
        id_partido: partido.id,
        equipo_local: partido.equipo_local.nombre,
        equipo_visitante: partido.equipo_visitante.nombre,
      }));
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
