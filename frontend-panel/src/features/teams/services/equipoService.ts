import { apiClient } from "@/services/api";
import { Equipo, PaginatedResponse } from "@types";
import { normalizeText } from "@utils/text";

const toEquipo = (equipo: any): Equipo => ({
  ...equipo,
  nombre: normalizeText(equipo.nombre ?? equipo.nombre_equipo),
  categoria: normalizeText(
    equipo.categoria ?? equipo.disciplina?.nombre ?? "General",
  ),
  cantidad_jugadores: equipo.cantidad_jugadores ?? equipo.jugadores?.length ?? 0,
  estado: equipo.estado ?? "registrado",
});

const toEquipoPayload = (data: Partial<Equipo>) => ({
  nombre_equipo: (data as any).nombre_equipo ?? data.nombre ?? "Equipo",
  carrera_id: (data as any).carrera_id ?? 1,
  disciplina_id: (data as any).disciplina_id ?? 1,
});

export const equipoService = {
  async obtenerEquipos(params?: any): Promise<PaginatedResponse<Equipo>> {
    const response = await apiClient.getPaginated<any>("/equipo", params);
    return {
      ...response,
      data: response.data.map(toEquipo),
    };
  },

  async obtenerEquipo(id: number): Promise<Equipo> {
    const response = await apiClient.get<any>(`/equipo/${id}`);
    return toEquipo(response.data);
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
