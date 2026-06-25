import { apiClient } from "@/services/api";
import { PaginatedResponse } from "@types";

export interface Categoria {
  id: number;
  nombre: string;
}

export const categoryService = {
  async obtenerCategorias(): Promise<PaginatedResponse<Categoria>> {
    const response = await apiClient.getPaginated<Categoria>("/categoria");
    return response;
  },
};
