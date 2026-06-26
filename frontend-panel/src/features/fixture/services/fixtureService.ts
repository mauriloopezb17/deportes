import axios, { AxiosInstance } from "axios";
import {
  FixtureMatch,
  FixtureTournament,
  GenerateFixturePayload,
} from "../types";

const API_BASE_URL = "https://test.62344037.xyz/";

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
    const response = await apiClient.get<FixtureTournament[]>("/torneo");
    return Array.isArray(response) ? response : [];
  },

  async getMatches() {
    const response = await apiClient.get<FixtureMatch[]>("/fixture");
    return (Array.isArray(response) ? response : []).map(normalizeMatch);
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
