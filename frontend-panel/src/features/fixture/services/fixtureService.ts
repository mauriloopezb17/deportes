import axios, { AxiosInstance } from "axios";
import {
  FixtureMatch,
  FixtureTournament,
  GenerateFixturePayload,
} from "../types";
import { API_BASE_URL, withTrailingSlash } from "@/services/apiUrl";
import { demoPartidos, demoTorneos, isDemoMode } from "@/data/demoData";

class FixtureApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      config.url = withTrailingSlash(config.url);
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private unwrap<T>(payload: T | { data?: T }) {
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data?: T }).data as T;
    }

    return payload as T;
  }

  async get<T>(url: string) {
    const response = await this.client.get(url);
    return this.unwrap<T>(response.data);
  }

  async post<T>(url: string, data: unknown) {
    const response = await this.client.post(url, data);
    return this.unwrap<T>(response.data);
  }

  async delete(url: string) {
    await this.client.delete(url);
  }
}

const apiClient = new FixtureApiClient();

const demoFixtureTournaments: FixtureTournament[] = demoTorneos.map((torneo) => ({
  id: torneo.id,
  nombre: torneo.nombre,
  fecha_inicio: torneo.fecha_inicio,
  disciplina: torneo.disciplina,
}));

const demoFixtureMatches: FixtureMatch[] = demoPartidos.map((partido, index) => ({
  id: partido.id,
  torneo_id: partido.torneo.id,
  ronda: index + 1,
  equipo_local_id: partido.equipo_local.id,
  equipo_visitante_id: partido.equipo_visitante.id,
  equipo_local: partido.equipo_local,
  equipo_visitante: partido.equipo_visitante,
  fecha: partido.fecha,
  hora: partido.hora,
  fecha_hora: `${partido.fecha}T${partido.hora}:00`,
  estadio: partido.cancha.nombre,
  cancha: partido.cancha,
  estado: partido.estado,
}));

const normalizeMatch = (match: FixtureMatch): FixtureMatch => {
  const fechaHora = match.fecha_hora ? String(match.fecha_hora) : "";
  const [fecha = match.fecha ?? "", time = ""] = fechaHora.split("T");

  return {
    ...match,
    fecha,
    hora: match.hora ?? time.slice(0, 5),
    equipo_local: match.equipo_local ?? match.equipoLocal,
    equipo_visitante: match.equipo_visitante ?? match.equipoVisitante,
    cancha: match.cancha ?? {
      id: 0,
      nombre: match.estadio || "Cancha por definir",
    },
  };
};

export const fixtureService = {
  async getTournaments() {
    if (isDemoMode) return demoFixtureTournaments;

    try {
      const response = await apiClient.get<FixtureTournament[]>("/torneo");
      return Array.isArray(response) && response.length
        ? response
        : demoFixtureTournaments;
    } catch {
      return demoFixtureTournaments;
    }
  },

  async getMatches() {
    if (isDemoMode) return demoFixtureMatches;

    try {
      const response = await apiClient.get<FixtureMatch[]>("/fixture");
      const matches = (Array.isArray(response) ? response : []).map(normalizeMatch);
      return matches.length ? matches : demoFixtureMatches;
    } catch {
      return demoFixtureMatches;
    }
  },

  async generateFixture(payload: GenerateFixturePayload) {
    const response = await apiClient.post<FixtureMatch[]>(
      "/fixture/generar",
      payload,
    );
    return (Array.isArray(response) ? response : []).map(normalizeMatch);
  },

  async deleteMatch(matchId: number) {
    await apiClient.delete(`/fixture/${matchId}`);
  },
};
