import { create } from "zustand";
import { Torneo, Partido } from "@types";
import { torneoService, partidoService } from "@/features/tournaments/services/tournamentService";

interface TournamentState {
  torneos: Torneo[];
  torneo: Torneo | null;
  partidos: Partido[];
  isLoading: boolean;
  error: string | null;
  obtenerTorneos: (params?: any) => Promise<void>;
  obtenerTorneo: (id: number) => Promise<void>;
  crearTorneo: (data: Partial<Torneo>) => Promise<void>;
  actualizarTorneo: (id: number, data: Partial<Torneo>) => Promise<void>;
  eliminarTorneo: (id: number) => Promise<void>;
  obtenerPartidos: (params?: any) => Promise<void>;
  obtenerPartidosPorTorneo: (torneoId: number) => Promise<void>;
  registrarResultado: (partidoId: number, resultado: any) => Promise<void>;
  crearPartido: (data: Partial<Partido>) => Promise<void>;
  generarFixture: (data: any) => Promise<void>;
  actualizarPartido: (id: number, data: Partial<Partido>) => Promise<void>;
  eliminarPartido: (id: number) => Promise<void>;
  limpiar: () => void;
  setError: (error: string | null) => void;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  torneos: [],
  torneo: null,
  partidos: [],
  isLoading: false,
  error: null,

  obtenerTorneos: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await torneoService.obtenerTorneos(params);
      set({ torneos: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener torneos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  obtenerTorneo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const torneo = await torneoService.obtenerTorneo(id);
      set({ torneo, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener torneo";
      set({ error: errorMessage, isLoading: false });
    }
  },

  crearTorneo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const torneo = await torneoService.crearTorneo(data);
      set((state) => ({
        torneos: [...state.torneos, torneo],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al crear torneo";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  actualizarTorneo: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const torneo = await torneoService.actualizarTorneo(id, data);
      set((state) => ({
        torneo,
        torneos: state.torneos.map((item) => (item.id === id ? torneo : item)),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar torneo";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  eliminarTorneo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await torneoService.eliminarTorneo(id);
      set((state) => ({
        torneos: state.torneos.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar torneo";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  obtenerPartidos: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partidoService.obtenerPartidos(params);
      set({ partidos: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener partidos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  obtenerPartidosPorTorneo: async (torneoId) => {
    set({ isLoading: true, error: null });
    try {
      const partidos = await partidoService.obtenerPartidosPorTorneo(torneoId);
      set({ partidos, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener partidos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  registrarResultado: async (partidoId, resultado) => {
    set({ isLoading: true, error: null });
    try {
      await partidoService.registrarResultado(partidoId, resultado);
      const partido = await partidoService.obtenerPartido(partidoId);
      set((state) => ({
        partidos: state.partidos.map((item) =>
          item.id === partidoId ? partido : item,
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al registrar resultado";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  crearPartido: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const partido = await partidoService.crearPartido(data);
      set((state) => ({
        partidos: [...state.partidos, partido],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al crear partido";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  generarFixture: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const partidos = await partidoService.generarFixture(data);
      set({ partidos, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al generar fixture";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  actualizarPartido: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const partido = await partidoService.actualizarPartido(id, data);
      set((state) => ({
        partidos: state.partidos.map((item) => (item.id === id ? partido : item)),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar partido";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  eliminarPartido: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await partidoService.eliminarPartido(id);
      set((state) => ({
        partidos: state.partidos.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar partido";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  limpiar: () => set({ torneos: [], torneo: null, partidos: [], error: null }),
  setError: (error) => set({ error }),
}));
