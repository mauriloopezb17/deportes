import { apiClient } from "@/services/api";
import { authService } from "@/features/auth/services/authService";

export interface CoachCategoria {
  id: number;
  nombre: string;
}

export interface CoachDisciplina {
  id: number;
  nombre: string;
}

export interface CoachResumen {
  entrenador_id: number;
  disciplina: CoachDisciplina | null;
  categorias: CoachCategoria[];
}

export interface CoachEquipo {
  id: number;
  nombre: string;
}

export interface CoachPartido {
  id: number;
  torneo_id: number;
  disciplina?: CoachDisciplina;
  equipo_local?: CoachEquipo;
  equipo_visitante?: CoachEquipo;
  fecha: string;
  hora: string;
  cancha?: {
    id: number;
    nombre: string;
  };
  estado: string;
  resultado_local?: number | null;
  resultado_visitante?: number | null;
}

export interface CoachJugadorEstadistica {
  id_deportista: number;
  nombre: string;
  puntos_goles: number;
  faltas_tarjetas_amarillas: number;
  faltas_tarjetas_rojas: number;
}

export interface CoachPartidoDetalle extends CoachPartido {
  permite_anotadores: boolean;
  jugadores_local: CoachJugadorEstadistica[];
  jugadores_visitante: CoachJugadorEstadistica[];
}

export interface RegistrarPartidoEntrenadorPayload {
  resultado_local: number;
  resultado_visitante: number;
  estadisticas: Array<{
    id_deportista: number;
    puntos_goles?: number;
    faltas_tarjetas_amarillas?: number;
    faltas_tarjetas_rojas?: number;
  }>;
}

const previewResumen: CoachResumen = {
  entrenador_id: 1,
  disciplina: {
    id: 1,
    nombre: "Futsal/Futbol",
  },
  categorias: [
    { id: 1, nombre: "Mayor cualquier edad" },
    { id: 2, nombre: "Sub 25" },
    { id: 3, nombre: "Juvenil de 19 para abajo" },
    { id: 4, nombre: "Menor de 17 para abajo" },
    { id: 5, nombre: "Infantil menoreso de 15 años" },
    { id: 6, nombre: "Mini Voleibol menores de 13" },
    { id: 7, nombre: "Sub 10" },
  ],
};

const previewMatches: CoachPartidoDetalle[] = [
  {
    id: 1,
    torneo_id: 1,
    disciplina: previewResumen.disciplina ?? undefined,
    equipo_local: { id: 1, nombre: "Ingenieria" },
    equipo_visitante: { id: 2, nombre: "Sistemas" },
    fecha: new Date().toISOString(),
    hora: "18:00",
    cancha: { id: 1, nombre: "Cancha futsal/futbol" },
    estado: "Pendiente",
    resultado_local: 0,
    resultado_visitante: 0,
    permite_anotadores: true,
    jugadores_local: [
      {
        id_deportista: 1,
        nombre: "Jugador Local 1",
        puntos_goles: 0,
        faltas_tarjetas_amarillas: 0,
        faltas_tarjetas_rojas: 0,
      },
      {
        id_deportista: 2,
        nombre: "Jugador Local 2",
        puntos_goles: 0,
        faltas_tarjetas_amarillas: 0,
        faltas_tarjetas_rojas: 0,
      },
    ],
    jugadores_visitante: [
      {
        id_deportista: 3,
        nombre: "Jugador Visitante 1",
        puntos_goles: 0,
        faltas_tarjetas_amarillas: 0,
        faltas_tarjetas_rojas: 0,
      },
      {
        id_deportista: 4,
        nombre: "Jugador Visitante 2",
        puntos_goles: 0,
        faltas_tarjetas_amarillas: 0,
        faltas_tarjetas_rojas: 0,
      },
    ],
  },
];

export const coachService = {
  async obtenerResumen(): Promise<CoachResumen> {
    if (authService.isPreview()) {
      return previewResumen;
    }

    const response = await apiClient.get<CoachResumen>("/entrenador-panel/resumen");
    return response.data as CoachResumen;
  },

  async obtenerPartidosPendientes(): Promise<CoachPartido[]> {
    if (authService.isPreview()) {
      return previewMatches;
    }

    const response = await apiClient.get<CoachPartido[]>(
      "/entrenador-panel/partidos-pendientes",
    );
    return response.data ?? [];
  },

  async obtenerPartido(id: number): Promise<CoachPartidoDetalle> {
    if (authService.isPreview()) {
      return (
        previewMatches.find((match) => match.id === id) ?? previewMatches[0]
      );
    }

    const response = await apiClient.get<CoachPartidoDetalle>(
      `/entrenador-panel/partidos/${id}`,
    );
    return response.data as CoachPartidoDetalle;
  },

  async registrarPartido(
    id: number,
    data: RegistrarPartidoEntrenadorPayload,
  ): Promise<CoachPartidoDetalle> {
    if (authService.isPreview()) {
      const match = previewMatches.find((item) => item.id === id) ?? previewMatches[0];
      return {
        ...match,
        resultado_local: data.resultado_local,
        resultado_visitante: data.resultado_visitante,
        estado: "Finalizado",
      };
    }

    const response = await apiClient.post<CoachPartidoDetalle>(
      `/entrenador-panel/partidos/${id}/registro`,
      data,
    );
    return response.data as CoachPartidoDetalle;
  },
};
