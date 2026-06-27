import { apiClient } from "@/services/api";
import { Disciplina, PaginatedResponse } from "@types";
import { normalizeText } from "@utils/text";
import {
  demoCarreras,
  demoDisciplinas,
  demoPage,
  isDemoMode,
} from "@/data/demoData";

export interface Carrera {
  id: number;
  nombre: string;
}

const toDisciplina = (disciplina: Disciplina): Disciplina => ({
  ...disciplina,
  nombre: normalizeText(disciplina.nombre),
  descripcion: normalizeText(disciplina.descripcion),
  reglas: normalizeText(disciplina.reglas),
});

export const disciplinaService = {
  async obtenerDisciplinas(
    params?: any,
  ): Promise<PaginatedResponse<Disciplina>> {
    if (isDemoMode) return demoPage(demoDisciplinas);

    try {
      const response = await apiClient.getPaginated<Disciplina>(
        "/disciplina",
        params,
      );
      return response.data.length
        ? { ...response, data: response.data.map(toDisciplina) }
        : demoPage(demoDisciplinas);
    } catch {
      return demoPage(demoDisciplinas);
    }
  },

  async obtenerDisciplina(id: number): Promise<Disciplina> {
    if (isDemoMode) {
      return demoDisciplinas.find((item) => item.id === id) ?? demoDisciplinas[0];
    }

    try {
      const response = await apiClient.get<Disciplina>(`/disciplina/${id}`);
      return toDisciplina(response.data!);
    } catch {
      return demoDisciplinas.find((item) => item.id === id) ?? demoDisciplinas[0];
    }
  },

  async crearDisciplina(data: Partial<Disciplina>): Promise<Disciplina> {
    const response = await apiClient.post<Disciplina>("/disciplina", data);
    return toDisciplina(response.data!);
  },

  async actualizarDisciplina(
    id: number,
    data: Partial<Disciplina>,
  ): Promise<Disciplina> {
    const response = await apiClient.patch<Disciplina>(
      `/disciplina/${id}`,
      data,
    );
    return toDisciplina(response.data!);
  },

  async eliminarDisciplina(id: number): Promise<void> {
    await apiClient.delete(`/disciplina/${id}`);
  },
};

export const carreraService = {
  async obtenerCarreras(params?: any): Promise<PaginatedResponse<Carrera>> {
    if (isDemoMode) return demoPage(demoCarreras);

    try {
      const response = await apiClient.getPaginated<Carrera>("/carrera", params);
      return response.data.length
        ? {
            ...response,
            data: response.data.map((carrera) => ({
              ...carrera,
              nombre: normalizeText(carrera.nombre),
            })),
          }
        : demoPage(demoCarreras);
    } catch {
      return demoPage(demoCarreras);
    }
  },
};
