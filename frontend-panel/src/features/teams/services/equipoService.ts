import { apiClient } from "@/services/api";
import { Equipo, PaginatedResponse } from "@types";
import { normalizeText } from "@utils/text";
import { demoEquipos, demoPage, isDemoMode } from "@/data/demoData";

const toEquipo = (equipo: any): Equipo => ({
  ...equipo,
  nombre: normalizeText(equipo.nombre ?? equipo.nombre_equipo),
  categoria: normalizeText(
    equipo.genero ??
      equipo.grupo ??
      equipo.categoria ??
      String(equipo.nombre ?? equipo.nombre_equipo ?? "").match(/\b(Damas|Varones)\b/i)?.[1] ??
      equipo.disciplina?.nombre ??
      "Sin género",
  ),
  cantidad_jugadores: equipo.cantidad_jugadores ?? equipo.jugadores?.length ?? 0,
  estado: equipo.estado ?? "registrado",
});

const toEquipoPayload = (data: Partial<Equipo>) => {
  const nombre = (data as any).nombre_equipo ?? data.nombre ?? "Equipo";
  const genero = data.categoria && ["Damas", "Varones"].includes(data.categoria)
    ? data.categoria
    : "";

  return {
    nombre_equipo:
      genero && !new RegExp(`\\b${genero}\\b`, "i").test(nombre)
        ? `${nombre} ${genero}`
        : nombre,
    carrera_id: (data as any).carrera_id ?? 1,
    disciplina_id: (data as any).disciplina_id ?? 1,
  };
};

export const equipoService = {
  async obtenerEquipos(params?: any): Promise<PaginatedResponse<Equipo>> {
    if (isDemoMode) return demoPage(demoEquipos);

    try {
      const response = await apiClient.getPaginated<any>("/equipo", params);
      if (!response.data.length) return demoPage(demoEquipos);
      return { ...response, data: response.data.map(toEquipo) };
    } catch {
      return demoPage(demoEquipos);
    }
  },

  async obtenerEquipo(id: number): Promise<Equipo> {
    if (isDemoMode) {
      return demoEquipos.find((equipo) => equipo.id === id) ?? demoEquipos[0];
    }

    try {
      const response = await apiClient.get<any>(`/equipo/${id}`);
      return toEquipo(response.data);
    } catch {
      return demoEquipos.find((equipo) => equipo.id === id) ?? demoEquipos[0];
    }
  },

  async crearEquipo(data: Partial<Equipo>): Promise<Equipo> {
    const response = await apiClient.post<any>("/equipo", toEquipoPayload(data));
    return toEquipo(response.data);
  },

  async actualizarEquipo(id: number, data: Partial<Equipo>): Promise<Equipo> {
    const response = await apiClient.patch<any>(
      `/equipo/${id}`,
      toEquipoPayload(data),
    );
    return toEquipo(response.data);
  },

  async eliminarEquipo(id: number): Promise<void> {
    await apiClient.delete(`/equipo/${id}`);
  },

  async obtenerEquiposPorAcademia(academiaId: number): Promise<Equipo[]> {
    const response = await this.obtenerEquipos({ academiaId });
    return response.data;
  },
};
