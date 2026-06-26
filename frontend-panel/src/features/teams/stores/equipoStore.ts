import { create } from "zustand";
import { Equipo } from "@types";
import { equipoService } from "@/features/teams/services/equipoService";

interface EquipoState {
  equipos: Equipo[];
  equipo: Equipo | null;
  isLoading: boolean;
  error: string | null;
  obtenerEquipos: (params?: any) => Promise<void>;
  obtenerEquipo: (id: number) => Promise<void>;
  crearEquipo: (data: Partial<Equipo>) => Promise<void>;
  actualizarEquipo: (id: number, data: Partial<Equipo>) => Promise<void>;
  eliminarEquipo: (id: number) => Promise<void>;
  limpiar: () => void;
  setError: (error: string | null) => void;
}

export const useEquipoStore = create<EquipoState>((set) => ({
  equipos: [],
  equipo: null,
  isLoading: false,
  error: null,

  obtenerEquipos: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await equipoService.obtenerEquipos(params);
      set({ equipos: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener equipos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  obtenerEquipo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const equipo = await equipoService.obtenerEquipo(id);
      set({ equipo, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener equipo";
      set({ error: errorMessage, isLoading: false });
    }
  },

  crearEquipo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const equipo = await equipoService.crearEquipo(data);
      set((state) => ({
        equipos: [...state.equipos, equipo],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al crear equipo";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  actualizarEquipo: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const equipo = await equipoService.actualizarEquipo(id, data);
      set((state) => ({
        equipo,
        equipos: state.equipos.map((item) => (item.id === id ? equipo : item)),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar equipo";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  eliminarEquipo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await equipoService.eliminarEquipo(id);
      set((state) => ({
        equipos: state.equipos.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar equipo";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  limpiar: () => set({ equipos: [], equipo: null, error: null }),
  setError: (error) => set({ error }),
}));
