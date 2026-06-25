import { create } from "zustand";
import { Reserva } from "@types";
import { ReservaPayload, reservaService } from "@/features/reservations/services/fieldService";

interface ReservationState {
  reservas: Reserva[];
  reserva: Reserva | null;
  isLoading: boolean;
  error: string | null;
  obtenerReservas: (params?: any) => Promise<void>;
  obtenerReserva: (id: number) => Promise<void>;
  crearReserva: (data: ReservaPayload) => Promise<void>;
  actualizarReserva: (id: number, data: ReservaPayload) => Promise<void>;
  cancelarReserva: (id: number, motivo: string) => Promise<void>;
  eliminarReserva: (id: number) => Promise<void>;
  obtenerDisponibilidad: (canchaId: number, fecha: string) => Promise<any[]>;
  limpiar: () => void;
  setError: (error: string | null) => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservas: [],
  reserva: null,
  isLoading: false,
  error: null,

  obtenerReservas: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservaService.obtenerReservas(params);
      set({ reservas: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener reservas";
      set({ error: errorMessage, isLoading: false });
    }
  },

  obtenerReserva: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const reserva = await reservaService.obtenerReserva(id);
      set({ reserva, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener reserva";
      set({ error: errorMessage, isLoading: false });
    }
  },

  crearReserva: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const reserva = await reservaService.crearReserva(data);
      set((state) => ({
        reservas: [...state.reservas, reserva],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al crear reserva";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  actualizarReserva: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const reserva = await reservaService.actualizarReserva(id, data);
      set((state) => ({
        reserva,
        reservas: state.reservas.map((item) => (item.id === id ? reserva : item)),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar reserva";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  cancelarReserva: async (id, motivo) => {
    set({ isLoading: true, error: null });
    try {
      await reservaService.cancelarReserva(id, motivo);
      set((state) => ({
        reservas: state.reservas.map((r) =>
          r.id === id
            ? { ...r, estado: "cancelada", observaciones: motivo }
            : r,
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al cancelar reserva";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  eliminarReserva: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await reservaService.eliminarReserva(id);
      set((state) => ({
        reservas: state.reservas.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar reserva";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  obtenerDisponibilidad: async (canchaId, fecha) => {
    try {
      return await reservaService.obtenerDisponibilidad(canchaId, fecha);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al obtener disponibilidad";
      set({ error: errorMessage });
      return [];
    }
  },

  limpiar: () => set({ reservas: [], reserva: null, error: null }),
  setError: (error) => set({ error }),
}));
