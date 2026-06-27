import { apiClient } from "@/services/api";
import { authService } from "@/features/auth/services/authService";
import {
  demoCategorias,
  demoEquiposPorJugador,
  demoJugadores,
  demoPartidos,
  isDemoMode,
} from "@/data/demoData";

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
    nombre: "Futsal",
  },
  categorias: demoCategorias,
};

const jugadoresDeEquipo = (equipoId: number): CoachJugadorEstadistica[] =>
  demoJugadores
    .filter((jugador) =>
      demoEquiposPorJugador[jugador.id]?.some((equipo) => equipo.id === equipoId),
    )
    .map((jugador) => ({
      id_deportista: jugador.id,
      nombre: `${jugador.persona.nombre} ${jugador.persona.apellido}`,
      puntos_goles: 0,
      faltas_tarjetas_amarillas: 0,
      faltas_tarjetas_rojas: 0,
    }));

const previewMatches: CoachPartidoDetalle[] = demoPartidos.map((partido) => ({
  id: partido.id,
  torneo_id: partido.torneo.id,
  disciplina: partido.torneo.disciplina,
  equipo_local: {
    id: partido.equipo_local.id,
    nombre: partido.equipo_local.nombre,
  },
  equipo_visitante: {
    id: partido.equipo_visitante.id,
    nombre: partido.equipo_visitante.nombre,
  },
  fecha: partido.fecha,
  hora: partido.hora,
  cancha: { id: partido.cancha.id, nombre: partido.cancha.nombre },
  estado: partido.estado,
  resultado_local: partido.resultado?.goles_local ?? null,
  resultado_visitante: partido.resultado?.goles_visitante ?? null,
  permite_anotadores: true,
  jugadores_local: jugadoresDeEquipo(partido.equipo_local.id),
  jugadores_visitante: jugadoresDeEquipo(partido.equipo_visitante.id),
}));

export const coachService = {
  async obtenerResumen(): Promise<CoachResumen> {
    if (isDemoMode || authService.isPreview()) {
      return previewResumen;
    }

    try {
      const response = await apiClient.get<CoachResumen>(
        "/entrenador-panel/resumen",
      );
      return response.data ?? previewResumen;
    } catch {
      return previewResumen;
    }
  },

  async obtenerPartidosPendientes(): Promise<CoachPartido[]> {
    if (isDemoMode || authService.isPreview()) {
      return previewMatches;
    }

    try {
      const response = await apiClient.get<CoachPartido[]>(
        "/entrenador-panel/partidos-pendientes",
      );
      return response.data?.length ? response.data : previewMatches;
    } catch {
      return previewMatches;
    }
  },

  async obtenerPartido(id: number): Promise<CoachPartidoDetalle> {
    if (isDemoMode || authService.isPreview()) {
      return (
        previewMatches.find((match) => match.id === id) ?? previewMatches[0]
      );
    }

    try {
      const response = await apiClient.get<CoachPartidoDetalle>(
        `/entrenador-panel/partidos/${id}`,
      );
      return response.data ?? previewMatches[0];
    } catch {
      return previewMatches.find((match) => match.id === id) ?? previewMatches[0];
    }
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
