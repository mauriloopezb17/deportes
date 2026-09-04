import { apiClient } from "@/services/api";
import { authService } from "@/features/auth/services/authService";
import { Cancha, Reserva, PaginatedResponse } from "@types";
import {
  demoCanchas,
  demoPage,
  demoReservas,
  isDemoMode,
} from "@/data/demoData";

export type ReservaPayload = Partial<Reserva> & {
  cancha_id?: number;
  equipo_id?: number;
};

export const canchaService = {
  async obtenerCanchas(params?: any): Promise<PaginatedResponse<Cancha>> {
    if (isDemoMode) return demoPage(demoCanchas);

    try {
      const response = await apiClient.getPaginated<Cancha>("/cancha", params);
      return response.data.length ? response : demoPage(demoCanchas);
    } catch {
      return demoPage(demoCanchas);
    }
  },

  async obtenerCancha(id: number): Promise<Cancha> {
    if (isDemoMode) {
      return demoCanchas.find((cancha) => cancha.id === id) ?? demoCanchas[0];
    }

    try {
      const response = await apiClient.get<Cancha>(`/cancha/${id}`);
      return response.data!;
    } catch {
      return demoCanchas.find((cancha) => cancha.id === id) ?? demoCanchas[0];
    }
  },

  async crearCancha(data: Partial<Cancha>): Promise<Cancha> {
    const response = await apiClient.post<Cancha>("/cancha", data);
    return response.data!;
  },

  async actualizarCancha(id: number, data: Partial<Cancha>): Promise<Cancha> {
    const response = await apiClient.patch<Cancha>(`/cancha/${id}`, data);
    return response.data!;
  },

  async eliminarCancha(id: number): Promise<void> {
    await apiClient.delete(`/cancha/${id}`);
  },
};

export const reservaService = {
  async obtenerReservas(params?: any): Promise<PaginatedResponse<Reserva>> {
    if (isDemoMode) return demoPage(demoReservas);

    // La vista previa no tiene un JWT del servicio externo; sin él la llamada
    // falla y no debe impedir que el resto del panel cargue.
    if (authService.isPreview()) {
      return demoPage(demoReservas);
    }

    try {
      const response = await apiClient.getPaginated<Reserva>("/reservas", params);
      return response.data.length ? response : demoPage(demoReservas);
    } catch {
      return demoPage(demoReservas);
    }
  },

  async obtenerReserva(id: number): Promise<Reserva> {
    if (isDemoMode) {
      return demoReservas.find((reserva) => reserva.id === id) ?? demoReservas[0];
    }

    try {
      const response = await apiClient.get<Reserva>(`/reservas/${id}`);
      return response.data!;
    } catch {
      return demoReservas.find((reserva) => reserva.id === id) ?? demoReservas[0];
    }
  },

  async crearReserva(data: ReservaPayload): Promise<Reserva> {
    const response = await apiClient.post<Reserva>("/reservas", data);
    return response.data!;
  },

  async actualizarReserva(
    id: number,
    data: ReservaPayload,
  ): Promise<Reserva> {
    const response = await apiClient.patch<Reserva>(`/reservas/${id}`, data);
    return response.data!;
  },

  async cancelarReserva(id: number, motivo: string): Promise<void> {
    await apiClient.patch(`/reservas/${id}`, {
      estado: "cancelada",
      observaciones: motivo,
    });
  },

  async eliminarReserva(id: number): Promise<void> {
    await apiClient.delete(`/reservas/${id}`);
  },

  async obtenerDisponibilidad(canchaId: number, fecha: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(
      `/horarios-disponibles/${canchaId}`,
      { fecha },
    );
    return response.data || [];
  },
};
