import { apiClient } from "@/services/api";
import { Torneo, Partido, ResultadoPartido, PaginatedResponse } from "@types";
import {
  demoPage,
  demoPartidos,
  demoTorneos,
  isDemoMode,
} from "@/data/demoData";

const toTorneo = (torneo: any): Torneo => ({
  ...torneo,
  descripcion: torneo.descripcion ?? torneo.tipo ?? "",
  estado: torneo.estado ?? "planeado",
  equipos: torneo.equipos ?? [],
  cantidad_rondas: torneo.cantidad_rondas ?? 0,
});

const toTorneoPayload = (data: Partial<Torneo>) => ({
  nombre: data.nombre ?? "Torneo",
  tipo: (data as any).tipo ?? data.descripcion ?? "Interno",
  estado: data.estado ?? "planeado",
  disciplina_id: (data as any).disciplina_id ?? data.disciplina?.id ?? 1,
  fecha_inicio: data.fecha_inicio,
  fecha_fin: data.fecha_fin,
  imagen_url: (data as any).imagen_url,
});

const toPartido = (fixture: any): Partido => {
  const fecha = fixture.fecha_hora ? String(fixture.fecha_hora).split("T")[0] : "";
  const hora = fixture.fecha_hora
    ? String(fixture.fecha_hora).split("T")[1]?.slice(0, 5) ?? ""
    : "";
  const equipoLocal = fixture.equipo_local ?? fixture.equipoLocal;
  const equipoVisitante = fixture.equipo_visitante ?? fixture.equipoVisitante;
  const normalizeEquipo = (equipo: any) =>
    equipo
      ? {
          ...equipo,
          nombre: equipo.nombre ?? equipo.nombre_equipo,
        }
      : equipo;

  return {
    ...fixture,
    equipo_local: normalizeEquipo(equipoLocal),
    equipo_visitante: normalizeEquipo(equipoVisitante),
    fecha,
    hora,
    estado:
      fixture.resultado_local !== null && fixture.resultado_local !== undefined
        ? "finalizado"
        : "pendiente",
    cancha: fixture.cancha ?? {
      id: 0,
      nombre: fixture.estadio ?? "Sin estadio",
      ubicacion: fixture.estadio ?? "",
      capacidad: 0,
      tipo_superficie: "",
      estado: "disponible",
    },
    resultado:
      fixture.resultado_local !== null && fixture.resultado_local !== undefined
        ? {
            id: fixture.id,
            partido: fixture,
            goles_local: fixture.resultado_local,
            goles_visitante: fixture.resultado_visitante ?? 0,
            tarjetas_amarillas_local: 0,
            tarjetas_amarillas_visitante: 0,
            tarjetas_rojas_local: 0,
            tarjetas_rojas_visitante: 0,
            observaciones: "",
            fecha_registro: fecha,
          }
        : undefined,
  };
};

const toFixturePayload = (data: Partial<Partido> | any) => ({
  torneo_id: data.torneo_id ?? data.torneo?.id ?? 1,
  ronda: data.ronda ?? 1,
  equipo_local_id: data.equipo_local_id ?? data.equipo_local?.id,
  equipo_visitante_id: data.equipo_visitante_id ?? data.equipo_visitante?.id,
  fecha_hora:
    data.fecha_hora ?? (data.fecha && data.hora ? `${data.fecha}T${data.hora}` : undefined),
  estadio: data.estadio ?? data.cancha?.nombre,
  resultado_local: data.resultado_local,
  resultado_visitante: data.resultado_visitante,
});

export const torneoService = {
  async obtenerTorneos(params?: any): Promise<PaginatedResponse<Torneo>> {
    if (isDemoMode) return demoPage(demoTorneos);

    try {
      const response = await apiClient.getPaginated<any>("/torneo", params);
      if (!response.data.length) return demoPage(demoTorneos);
      return { ...response, data: response.data.map(toTorneo) };
    } catch {
      return demoPage(demoTorneos);
    }
  },

  async obtenerTorneo(id: number): Promise<Torneo> {
    if (isDemoMode) {
      return demoTorneos.find((torneo) => torneo.id === id) ?? demoTorneos[0];
    }

    try {
      const response = await apiClient.get<any>(`/torneo/${id}`);
      return toTorneo(response.data);
    } catch {
      return demoTorneos.find((torneo) => torneo.id === id) ?? demoTorneos[0];
    }
  },

  async crearTorneo(data: Partial<Torneo>): Promise<Torneo> {
    const response = await apiClient.post<any>("/torneo", toTorneoPayload(data));
    return toTorneo(response.data);
  },

  async actualizarTorneo(id: number, data: Partial<Torneo>): Promise<Torneo> {
    const response = await apiClient.patch<any>(
      `/torneo/${id}`,
      toTorneoPayload(data),
    );
    return toTorneo(response.data);
  },

  async eliminarTorneo(id: number): Promise<void> {
    await apiClient.delete(`/torneo/${id}`);
  },

  async agregarEquipoATorneo(
    torneoId: number,
    equipoId: number,
  ): Promise<void> {
    await apiClient.post("/torneo-equipo", {
      torneo_id: torneoId,
      equipo_id: equipoId,
    });
  },

  async removerEquipoDelTorneo(
    torneoId: number,
    equipoId: number,
  ): Promise<void> {
    await apiClient.delete(`/torneo-equipo/${torneoId}/${equipoId}`);
  },
};

export const partidoService = {
  async obtenerPartidos(params?: any): Promise<PaginatedResponse<Partido>> {
    if (isDemoMode) return demoPage(demoPartidos);

    try {
      const response = await apiClient.getPaginated<any>("/fixture", params);
      if (!response.data.length) return demoPage(demoPartidos);
      return { ...response, data: response.data.map(toPartido) };
    } catch {
      return demoPage(demoPartidos);
    }
  },

  async obtenerPartido(id: number): Promise<Partido> {
    if (isDemoMode) {
      return demoPartidos.find((partido) => partido.id === id) ?? demoPartidos[0];
    }

    try {
      const response = await apiClient.get<any>(`/fixture/${id}`);
      return toPartido(response.data);
    } catch {
      return demoPartidos.find((partido) => partido.id === id) ?? demoPartidos[0];
    }
  },

  async crearPartido(data: Partial<Partido>): Promise<Partido> {
    const response = await apiClient.post<any>("/fixture", toFixturePayload(data));
    return toPartido(response.data);
  },

  async actualizarPartido(
    id: number,
    data: Partial<Partido>,
  ): Promise<Partido> {
    const response = await apiClient.patch<any>(
      `/fixture/${id}`,
      toFixturePayload(data),
    );
    return toPartido(response.data);
  },

  async registrarResultado(
    partidoId: number,
    resultado: Partial<ResultadoPartido>,
  ): Promise<ResultadoPartido> {
    const response = await apiClient.patch<any>(`/fixture/${partidoId}`, {
      resultado_local: resultado.goles_local,
      resultado_visitante: resultado.goles_visitante,
    });
    return toPartido(response.data).resultado as ResultadoPartido;
  },

  async obtenerResultado(partidoId: number): Promise<ResultadoPartido> {
    const response = await this.obtenerPartido(partidoId);
    return response.resultado!;
  },

  async obtenerPartidosPorTorneo(torneoId: number): Promise<Partido[]> {
    if (isDemoMode) {
      return demoPartidos.filter((partido) => partido.torneo.id === torneoId);
    }

    try {
      const response = await apiClient.get<any[]>(`/fixture/torneo/${torneoId}`);
      const partidos = (response.data || []).map(toPartido);
      return partidos.length
        ? partidos
        : demoPartidos.filter((partido) => partido.torneo.id === torneoId);
    } catch {
      return demoPartidos.filter((partido) => partido.torneo.id === torneoId);
    }
  },

  async generarFixture(data: any): Promise<Partido[]> {
    const response = await apiClient.post<any[]>("/fixture/generar", data);
    return (response.data || []).map(toPartido);
  },

  async eliminarPartido(id: number): Promise<void> {
    await apiClient.delete(`/fixture/${id}`);
  },
};
