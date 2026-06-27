import { apiClient } from "@/services/api";
import { PaginatedResponse } from "@types";
import { demoCategorias, demoPage, isDemoMode } from "@/data/demoData";

export interface Categoria {
  id: number;
  nombre: string;
}

export const categoryService = {
  async obtenerCategorias(): Promise<PaginatedResponse<Categoria>> {
    if (isDemoMode) return demoPage(demoCategorias);

    try {
      const response = await apiClient.getPaginated<Categoria>("/categoria");
      return response.data.length ? response : demoPage(demoCategorias);
    } catch {
      return demoPage(demoCategorias);
    }
  },
};
