import { apiClient } from "@/services/api";
import { Disciplina, PaginatedResponse } from "@types";
import { normalizeText } from "@utils/text";

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
    const response = await apiClient.getPaginated<Disciplina>(
      "/disciplina",
      params,
    );
    return {
      ...response,
      data: response.data.map(toDisciplina),
    };
  },

  async obtenerDisciplina(id: number): Promise<Disciplina> {
    const response = await apiClient.get<Disciplina>(`/disciplina/${id}`);
    return toDisciplina(response.data!);
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
    const response = await apiClient.getPaginated<Carrera>("/carrera", params);
    return {
      ...response,
      data: response.data.map((carrera) => ({
        ...carrera,
        nombre: normalizeText(carrera.nombre),
      })),
    };
  },
};
