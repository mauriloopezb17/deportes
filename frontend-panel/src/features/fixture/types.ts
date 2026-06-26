export interface FixtureTeam {
  id: number;
  nombre?: string;
  nombre_equipo?: string;
}

export interface FixtureCourt {
  id: number;
  nombre: string;
}

export interface FixtureMatch {
  id: number;
  torneo_id: number;
  ronda: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  equipo_local?: FixtureTeam;
  equipo_visitante?: FixtureTeam;
  equipoLocal?: FixtureTeam;
  equipoVisitante?: FixtureTeam;
  fecha_hora?: string;
  fecha?: string;
  hora?: string;
  estadio?: string;
  cancha?: FixtureCourt;
  estado?: string;
}

export interface FixtureTournament {
  id: number;
  nombre: string;
  fecha_inicio?: string;
  disciplina?: {
    id: number;
    nombre: string;
  };
}

export interface GenerateFixturePayload {
  torneo_id: number;
  fecha_inicio: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  reemplazar_existente: boolean;
}
