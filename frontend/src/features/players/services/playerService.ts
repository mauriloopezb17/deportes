import { apiClient } from "@/services/api";
import { Equipo, Jugador, Persona, PaginatedResponse, UserRole } from "@types";
import { normalizeText } from "@utils/text";

const normalizeRole = (role: string): UserRole | string => {
  const roles: Record<string, UserRole> = {
    Administrador: UserRole.ADMIN,
    Admin: UserRole.ADMIN,
    ADMIN: UserRole.ADMIN,
    Delegado: UserRole.DELEGADO,
    DELEGADO: UserRole.DELEGADO,
    Jugador: UserRole.JUGADOR,
    JUGADOR: UserRole.JUGADOR,
  };

  return roles[role] || role.toUpperCase();
};

const toPersona = (persona: any): Persona => ({
  ...persona,
  cedula: persona.cedula ?? persona.carnet ?? "",
  telefono: persona.telefono ?? persona.celular ?? "",
  roles: (persona.roles || [])
    .map((personaRol: any) =>
      normalizeRole(personaRol.rol?.nombre ?? personaRol.nombre ?? personaRol),
    )
    .filter(Boolean),
});

const toJugador = (item: any): Jugador => {
  const persona = item.persona ?? item.jugador ?? item;

  return {
    ...item,
    id: item.id ?? persona.id,
    persona: toPersona(persona),
    numero_camiseta: item.numero_camiseta ?? 0,
    posicion: item.posicion ?? "",
    estado: item.estado ?? "activo",
  };
};

const toPersonaPayload = (data: Partial<Persona> | Partial<Jugador>) => {
  const persona = (data as any).persona ?? data;

  return {
    nombre: persona.nombre ?? "Jugador",
    apellido: persona.apellido ?? "",
    carnet: persona.carnet ?? persona.cedula ?? `${Date.now()}`,
    email: persona.email ?? `jugador${Date.now()}@ucb.edu.bo`,
    celular: persona.celular ?? persona.telefono ?? "70000000",
  };
};

export const jugadorService = {
  async obtenerJugadores(params?: any): Promise<PaginatedResponse<Jugador>> {
    const response = await apiClient.getPaginated<any>("/persona", params);
    return {
      ...response,
      data: response.data.map(toJugador),
    };
  },

  async obtenerJugador(id: number): Promise<Jugador> {
    const response = await apiClient.get<any>(`/persona/${id}`);
    return toJugador(response.data);
  },

  async crearJugador(data: Partial<Jugador>): Promise<Jugador> {
    const response = await apiClient.post<any>("/persona", toPersonaPayload(data));
    return toJugador(response.data);
  },

  async actualizarJugador(
    id: number,
    data: Partial<Jugador>,
  ): Promise<Jugador> {
    const response = await apiClient.patch<any>(
      `/persona/${id}`,
      toPersonaPayload(data),
    );
    return toJugador(response.data);
  },

  async eliminarJugador(id: number): Promise<void> {
    await apiClient.delete(`/persona/${id}`);
  },

  async obtenerJugadoresPorEquipo(equipoId: number): Promise<Jugador[]> {
    const response = await apiClient.get<Jugador[]>(
      `/jugador-equipo/equipo/${equipoId}`,
    );
    return (response.data || []).map(toJugador);
  },

  async obtenerEquiposPorJugador(jugadorId: number): Promise<Equipo[]> {
    const response = await apiClient.get<any[]>(
      `/jugador-equipo/jugador/${jugadorId}`,
    );

    return (response.data || []).map((relacion) => ({
      ...relacion.equipo,
      nombre: normalizeText(
        relacion.equipo?.nombre ?? relacion.equipo?.nombre_equipo,
      ),
      categoria: normalizeText(relacion.equipo?.disciplina?.nombre ?? "General"),
      cantidad_jugadores: relacion.equipo?.jugadores?.length ?? 0,
      estado: relacion.equipo?.estado ?? "registrado",
    }) as Equipo);
  },

  async agregarJugadorAEquipo(
    jugadorId: number,
    equipoId: number,
    numeroCamiseta: number,
    posicion: string,
  ): Promise<void> {
    await apiClient.post("/jugador-equipo", {
      jugador_id: jugadorId,
      equipo_id: equipoId,
    });
    void numeroCamiseta;
    void posicion;
  },

  async asignarJugadorAEquipo(jugadorId: number, equipoId?: number): Promise<void> {
    const equiposActuales = await this.obtenerEquiposPorJugador(jugadorId);

    await Promise.all(
      equiposActuales
        .filter((equipo) => equipo.id !== equipoId)
        .map((equipo) => apiClient.delete(`/jugador-equipo/${jugadorId}/${equipo.id}`)),
    );

    if (!equipoId || equiposActuales.some((equipo) => equipo.id === equipoId)) {
      return;
    }

    await this.agregarJugadorAEquipo(jugadorId, equipoId, 0, "");
  },
};

export const personaService = {
  async obtenerPersonas(params?: any): Promise<PaginatedResponse<Persona>> {
    const response = await apiClient.getPaginated<any>("/persona", params);
    return {
      ...response,
      data: response.data.map(toPersona),
    };
  },

  async obtenerPersona(id: number): Promise<Persona> {
    const response = await apiClient.get<any>(`/persona/${id}`);
    return toPersona(response.data);
  },

  async crearPersona(data: Partial<Persona>): Promise<Persona> {
    const response = await apiClient.post<any>("/persona", data);
    return toPersona(response.data);
  },

  async actualizarPersona(
    id: number,
    data: Partial<Persona>,
  ): Promise<Persona> {
    const response = await apiClient.patch<any>(`/persona/${id}`, data);
    return toPersona(response.data);
  },

  async eliminarPersona(id: number): Promise<void> {
    await apiClient.delete(`/persona/${id}`);
  },

  async asignarRolJugador(personaId: number): Promise<void> {
    const rolesPersona = await apiClient.get<any[]>(
      `/persona-rol/persona/${personaId}`,
    );
    const yaEsJugador = (rolesPersona.data || []).some(
      (personaRol) =>
        normalizeRole(personaRol.rol?.nombre ?? "") === UserRole.JUGADOR,
    );

    if (yaEsJugador) {
      return;
    }

    const roles = await apiClient.getPaginated<any>("/rol");
    const rolJugador = roles.data.find(
      (rol) => normalizeRole(rol.nombre) === UserRole.JUGADOR,
    );

    if (!rolJugador) {
      return;
    }

    await apiClient.post("/persona-rol", {
      persona_id: personaId,
      rol_id: rolJugador.id,
    });
  },
};
