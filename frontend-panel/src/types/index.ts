// Enums y Tipos
export enum UserRole {
  ADMIN = "ADMIN",
  DELEGADO = "DELEGADO",
  ENTRENADOR = "ENTRENADOR",
  JUGADOR = "JUGADOR",
  ESTUDIANTE = "ESTUDIANTE",
}

export interface Usuario {
  id: number;
  persona_id?: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: UserRole[];
  carrera_id?: number;
  academia?: Academia;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
  user?: Usuario;
}

export interface Academia {
  id: number;
  nombre: string;
  director: string;
  contacto: string;
  saldo: number;
  estado: "activa" | "inactiva";
}

export interface Equipo {
  id: number;
  nombre: string;
  categoria: string;
  carrera_id?: number;
  disciplina_id?: number;
  disciplina: Disciplina;
  academia: Academia;
  delegado: Usuario;
  cantidad_jugadores: number;
  estado: "registrado" | "confirmado" | "descalificado";
  fecha_registro: string;
}

export interface Jugador {
  id: number;
  persona: Persona;
  numero_camiseta: number;
  posicion: string;
  estado: "activo" | "lesionado" | "suspendido";
}

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  fecha_nacimiento: string;
  email: string;
  telefono: string;
  genero: string;
  carrera_id?: number;
  carrera?: {
    id: number;
    nombre: string;
  };
  tipo_deportista?: "ucb" | "club";
  categoria_id?: number;
  categoria?: {
    id: number;
    nombre: string;
  };
  roles?: UserRole[];
}

export interface Disciplina {
  id: number;
  nombre: string;
  descripcion: string;
  reglas: string;
}

export interface Cancha {
  id: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  tipo_superficie: string;
  estado: "disponible" | "ocupada" | "mantenimiento";
}

export interface Reserva {
  id: number;
  cancha_id?: number;
  equipo_id?: number;
  cancha: Cancha;
  equipo?: Equipo;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: "confirmada" | "pendiente" | "cancelada";
  observaciones?: string;
}

export interface Torneo {
  id: number;
  nombre: string;
  descripcion: string;
  disciplina: Disciplina;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "planeado" | "en_curso" | "finalizado";
  equipos: Equipo[];
  cantidad_rondas: number;
}

export interface Partido {
  id: number;
  torneo: Torneo;
  equipo_local: Equipo;
  equipo_visitante: Equipo;
  fecha: string;
  hora: string;
  cancha: Cancha;
  estado: "pendiente" | "en_curso" | "finalizado";
  resultado?: ResultadoPartido;
}

export interface ResultadoPartido {
  id: number;
  partido: Partido;
  goles_local: number;
  goles_visitante: number;
  tarjetas_amarillas_local: number;
  tarjetas_amarillas_visitante: number;
  tarjetas_rojas_local: number;
  tarjetas_rojas_visitante: number;
  observaciones: string;
  fecha_registro: string;
}

export interface Pago {
  id: number;
  academia: Academia;
  monto: number;
  concepto: string;
  fecha_vencimiento: string;
  estado: "pendiente" | "pagado" | "vencido";
  fecha_pago?: string;
}

export interface Comunicado {
  id: number;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  autor: Usuario;
  estado: "publicado" | "borrador";
}

export interface HistorialClub {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
