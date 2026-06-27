import {
  Academia,
  Cancha,
  Disciplina,
  Equipo,
  Jugador,
  PaginatedResponse,
  Partido,
  Persona,
  Reserva,
  Torneo,
  UserRole,
  Usuario,
} from "@types";

export const isDemoMode = import.meta.env.VITE_USE_DEMO_DATA === "true";

export const demoPage = <T>(data: T[]): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination: {
    total: data.length,
    page: 1,
    limit: data.length,
    pages: 1,
  },
});

export const demoCarreras = [
  { id: 1, id_carrera: 1, nombre: "Ingeniería de Sistemas", sigla: "SIS" },
  { id: 2, id_carrera: 2, nombre: "Arquitectura", sigla: "ARQ" },
  { id: 3, id_carrera: 3, nombre: "Administración de Empresas", sigla: "ADM" },
  { id: 4, id_carrera: 4, nombre: "Derecho", sigla: "DER" },
  { id: 5, id_carrera: 5, nombre: "Comunicación Social", sigla: "COM" },
  { id: 6, id_carrera: 6, nombre: "Psicología", sigla: "PSI" },
];

// Estas son las únicas disciplinas habilitadas actualmente.
export const demoDisciplinas: Disciplina[] = [
  {
    id: 1,
    nombre: "Futsal",
    descripcion: "Fútbol de salón universitario",
    reglas: "Cinco jugadores por equipo y dos tiempos de veinte minutos.",
  },
  {
    id: 2,
    nombre: "Voleibol",
    descripcion: "Voleibol universitario femenino, masculino y mixto",
    reglas: "Partidos al mejor de tres sets.",
  },
  {
    id: 3,
    nombre: "Básquet",
    descripcion: "Básquet universitario",
    reglas: "Cuatro cuartos de diez minutos.",
  },
];

export const demoCategorias = [
  { id: 1, nombre: "Mayor cualquier edad" },
  { id: 2, nombre: "Sub 25" },
  { id: 3, nombre: "Juvenil de 19 para abajo" },
  { id: 4, nombre: "Menor de 17 para abajo" },
  { id: 5, nombre: "Infantil menores de 15 años" },
  { id: 6, nombre: "Mini Voleibol menores de 13" },
  { id: 7, nombre: "Sub 10" },
];

export const demoRoles = [
  { id: 1, id_rol: 1, nombre: "Administrador", nombre_rol: "Administrador" },
  { id: 2, id_rol: 2, nombre: "Delegado", nombre_rol: "Delegado" },
  { id: 3, id_rol: 3, nombre: "Entrenador", nombre_rol: "Entrenador" },
  { id: 4, id_rol: 4, nombre: "Jugador", nombre_rol: "Jugador" },
];

const demoAcademia: Academia = {
  id: 1,
  nombre: "Universidad Católica Boliviana",
  director: "Dirección de Deportes",
  contacto: "deportes@ucb.edu.bo",
  saldo: 0,
  estado: "activa",
};

const demoDelegado: Usuario = {
  id: 100,
  nombre: "María",
  apellido: "Gutiérrez",
  email: "maria.gutierrez@ucb.edu.bo",
  roles: [UserRole.DELEGADO],
  carrera_id: 1,
};

const createTeam = (
  id: number,
  nombre: string,
  carreraId: number,
  disciplinaId: number,
  genero: "Damas" | "Varones",
  cantidadJugadores: number,
  estado: Equipo["estado"] = "confirmado",
): Equipo => ({
  id,
  nombre,
  categoria: genero,
  carrera_id: carreraId,
  disciplina_id: disciplinaId,
  disciplina: demoDisciplinas[disciplinaId - 1],
  academia: demoAcademia,
  delegado: {
    ...demoDelegado,
    id: 100 + id,
    carrera_id: carreraId,
    email: `delegado${id}@ucb.edu.bo`,
  },
  cantidad_jugadores: cantidadJugadores,
  estado,
  fecha_registro: `2026-06-${String(id).padStart(2, "0")}`,
});

export const demoEquipos: Equipo[] = [
  createTeam(1, "Sistemas Futsal Varones", 1, 1, "Varones", 12),
  createTeam(2, "Arquitectura Futsal Damas", 2, 1, "Damas", 11),
  createTeam(3, "Administración Futsal Varones", 3, 1, "Varones", 10),
  createTeam(4, "Derecho Futsal Damas", 4, 1, "Damas", 12),
  createTeam(5, "Sistemas Voleibol Damas", 1, 2, "Damas", 14),
  createTeam(6, "Arquitectura Voleibol Varones", 2, 2, "Varones", 13),
  createTeam(7, "Psicología Voleibol Damas", 6, 2, "Damas", 12),
  createTeam(8, "Comunicación Voleibol Varones", 5, 2, "Varones", 11, "registrado"),
  createTeam(9, "Administración Básquet Varones", 3, 3, "Varones", 12),
  createTeam(10, "Derecho Básquet Damas", 4, 3, "Damas", 11),
  createTeam(11, "Sistemas Básquet Damas", 1, 3, "Damas", 10),
  createTeam(12, "Psicología Básquet Varones", 6, 3, "Varones", 10, "registrado"),
];

const createPerson = (
  id: number,
  nombre: string,
  apellido: string,
  carreraId: number,
  genero: string,
): Persona => ({
  id,
  nombre,
  apellido,
  cedula: `10${String(10000 + id)}`,
  fecha_nacimiento: `200${id % 6}-${String((id % 12) + 1).padStart(2, "0")}-15`,
  email: `${nombre}.${apellido}${id}@ucb.edu.bo`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase(),
  telefono: `700000${String(id).padStart(2, "0")}`,
  genero,
  carrera_id: carreraId,
  carrera: {
    id: carreraId,
    nombre: demoCarreras[carreraId - 1].nombre,
  },
  roles: [UserRole.JUGADOR],
  tipo_deportista: "ucb",
});

export const demoPersonas: Persona[] = [
  createPerson(1, "Andrea", "Pérez", 1, "F"),
  createPerson(2, "Diego", "Flores", 1, "M"),
  createPerson(3, "Valeria", "Mendoza", 2, "F"),
  createPerson(4, "Mateo", "Vargas", 3, "M"),
  createPerson(5, "Camila", "Rojas", 1, "F"),
  createPerson(6, "Sebastián", "López", 1, "M"),
  createPerson(7, "Daniela", "Suárez", 2, "F"),
  createPerson(8, "Alejandro", "Torres", 6, "M"),
  createPerson(9, "Luciana", "Gómez", 3, "F"),
  createPerson(10, "Nicolás", "Romero", 3, "M"),
  createPerson(11, "Fernanda", "Castro", 4, "F"),
  createPerson(12, "Gabriel", "Ortiz", 1, "M"),
  createPerson(13, "Mariana", "Salazar", 4, "F"),
  createPerson(14, "Santiago", "Paredes", 5, "M"),
  createPerson(15, "Paola", "Vega", 6, "F"),
  createPerson(16, "Rodrigo", "Molina", 2, "M"),
];

const createClubPlayer = (
  id: number,
  nombre: string,
  apellido: string,
  categoriaId: number,
  genero: string,
  email: string,
): Persona => ({
  id,
  nombre,
  apellido,
  cedula: `20${String(10000 + id)}`,
  fecha_nacimiento: `${2014 - categoriaId}-${String((id % 12) + 1).padStart(2, "0")}-10`,
  email,
  telefono: `710000${String(id).padStart(2, "0")}`,
  genero,
  tipo_deportista: "club",
  categoria_id: categoriaId,
  categoria: demoCategorias[categoriaId - 1],
  roles: [UserRole.JUGADOR],
});

demoPersonas.push(
  createClubPlayer(17, "José", "Aguilar", 1, "M", "jose.aguilar@gmail.com"),
  createClubPlayer(18, "Natalia", "Céspedes", 2, "F", "natalia.cespedes@outlook.com"),
  createClubPlayer(19, "Bruno", "Arce", 3, "M", "bruno.arce@gmail.com"),
  createClubPlayer(20, "Adriana", "Rivera", 3, "F", "adriana.rivera@hotmail.com"),
  createClubPlayer(21, "Thiago", "Núñez", 4, "M", "thiago.nunez@gmail.com"),
  createClubPlayer(22, "Isabella", "Soto", 4, "F", "isabella.soto@outlook.com"),
  createClubPlayer(23, "Martín", "Villarroel", 5, "M", "martin.villarroel@gmail.com"),
  createClubPlayer(24, "Emma", "León", 5, "F", "emma.leon@hotmail.com"),
  createClubPlayer(25, "Lucas", "Peña", 6, "M", "lucas.pena@gmail.com"),
  createClubPlayer(26, "Sofía", "Méndez", 7, "F", "sofia.mendez@outlook.com"),
);

const posiciones = [
  "Pívot",
  "Ala",
  "Armadora",
  "Central",
  "Líbero",
  "Base",
  "Escolta",
  "Alero",
];

export const demoJugadores: Jugador[] = demoPersonas.map((persona, index) => ({
  id: persona.id,
  persona,
  numero_camiseta: (index % 15) + 1,
  posicion: posiciones[index % posiciones.length],
  estado: index === 14 ? "lesionado" : "activo",
}));

const equipoPorPersona = [1, 1, 2, 3, 5, 5, 6, 7, 9, 9, 10, 11, 4, 8, 12, 6];

export const demoEquiposPorJugador: Record<number, Equipo[]> = Object.fromEntries(
  demoPersonas.slice(0, equipoPorPersona.length).map((persona, index) => [
    persona.id,
    [demoEquipos[equipoPorPersona[index] - 1]],
  ]),
);

// Solo existen estas dos canchas. Voleibol y básquet comparten el coliseo.
export const demoCanchas: Cancha[] = [
  {
    id: 1,
    nombre: "Cancha de futsal",
    ubicacion: "Campus UCB",
    capacidad: 180,
    tipo_superficie: "Césped sintético",
    estado: "disponible",
  },
  {
    id: 2,
    nombre: "Coliseo",
    ubicacion: "Bloque deportivo UCB",
    capacidad: 500,
    tipo_superficie: "Parqué",
    estado: "disponible",
  },
];

export const demoTorneos: Torneo[] = [
  {
    id: 1,
    nombre: "Intercarreras Futsal 2026 Varones",
    descripcion: "Primera división universitaria de futsal.",
    disciplina: demoDisciplinas[0],
    fecha_inicio: "2026-06-01",
    fecha_fin: "2026-07-25",
    estado: "en_curso",
    equipos: [demoEquipos[0], demoEquipos[2]],
    cantidad_rondas: 6,
  },
  {
    id: 2,
    nombre: "Intercarreras Futsal 2026 Damas",
    descripcion: "Torneo corto de eliminación directa.",
    disciplina: demoDisciplinas[0],
    fecha_inicio: "2026-08-01",
    fecha_fin: "2026-08-03",
    estado: "planeado",
    equipos: [demoEquipos[1], demoEquipos[3]],
    cantidad_rondas: 2,
  },
  {
    id: 3,
    nombre: "Intercarreras Voleibol 2026 Damas",
    descripcion: "Competencia mixta entre carreras.",
    disciplina: demoDisciplinas[1],
    fecha_inicio: "2026-06-10",
    fecha_fin: "2026-07-30",
    estado: "en_curso",
    equipos: [demoEquipos[4], demoEquipos[6]],
    cantidad_rondas: 6,
  },
  {
    id: 4,
    nombre: "Intercarreras Voleibol 2026 Varones",
    descripcion: "Encuentro amistoso de cierre de semestre.",
    disciplina: demoDisciplinas[1],
    fecha_inicio: "2026-08-08",
    fecha_fin: "2026-08-09",
    estado: "planeado",
    equipos: [demoEquipos[5], demoEquipos[7]],
    cantidad_rondas: 2,
  },
  {
    id: 5,
    nombre: "Intercarreras Básquet 2026 Varones",
    descripcion: "Campeonato universitario de básquet.",
    disciplina: demoDisciplinas[2],
    fecha_inicio: "2026-06-15",
    fecha_fin: "2026-08-05",
    estado: "en_curso",
    equipos: [demoEquipos[8], demoEquipos[11]],
    cantidad_rondas: 6,
  },
  {
    id: 6,
    nombre: "Intercarreras Básquet 2026 Damas",
    descripcion: "Jornada de básquet 3x3 en el coliseo.",
    disciplina: demoDisciplinas[2],
    fecha_inicio: "2026-08-15",
    fecha_fin: "2026-08-16",
    estado: "planeado",
    equipos: [demoEquipos[9], demoEquipos[10]],
    cantidad_rondas: 2,
  },
];

const createMatch = (
  id: number,
  torneoIndex: number,
  localIndex: number,
  visitanteIndex: number,
  fecha: string,
  hora: string,
  canchaIndex: number,
  estado: Partido["estado"] = "pendiente",
): Partido => ({
  id,
  torneo: demoTorneos[torneoIndex],
  equipo_local: demoEquipos[localIndex],
  equipo_visitante: demoEquipos[visitanteIndex],
  fecha,
  hora,
  cancha: demoCanchas[canchaIndex],
  estado,
});

export const demoPartidos: Partido[] = [
  createMatch(1, 0, 0, 2, "2026-06-24", "16:00", 0, "finalizado"),
  createMatch(2, 1, 1, 3, "2026-06-25", "18:00", 0, "finalizado"),
  createMatch(5, 2, 4, 6, "2026-06-26", "17:00", 1, "finalizado"),
  createMatch(6, 3, 5, 7, "2026-06-27", "19:00", 1),
  createMatch(9, 4, 8, 11, "2026-06-23", "20:00", 1, "finalizado"),
  createMatch(10, 5, 9, 10, "2026-06-28", "20:00", 1),
];

const createReservation = (
  id: number,
  canchaIndex: number,
  equipoIndex: number,
  fecha: string,
  horaInicio: string,
  horaFin: string,
  estado: Reserva["estado"],
  observaciones: string,
): Reserva => ({
  id,
  cancha_id: demoCanchas[canchaIndex].id,
  equipo_id: demoEquipos[equipoIndex].id,
  cancha: demoCanchas[canchaIndex],
  equipo: demoEquipos[equipoIndex],
  fecha,
  hora_inicio: horaInicio,
  hora_fin: horaFin,
  estado,
  observaciones,
});

export const demoReservas: Reserva[] = [
  createReservation(1, 0, 0, "2026-06-28", "15:30", "18:00", "confirmada", "Fecha de futsal"),
  createReservation(2, 0, 1, "2026-06-29", "17:00", "19:30", "confirmada", "Fecha de futsal"),
  createReservation(3, 0, 3, "2026-06-30", "16:00", "17:30", "pendiente", "Entrenamiento de futsal"),
  createReservation(4, 0, 2, "2026-07-01", "18:00", "19:30", "confirmada", "Entrenamiento de futsal"),
  createReservation(5, 1, 6, "2026-06-27", "18:30", "20:30", "confirmada", "Partido de voleibol"),
  createReservation(6, 1, 4, "2026-07-02", "17:30", "19:30", "confirmada", "Partido de voleibol"),
  createReservation(7, 1, 5, "2026-07-04", "09:30", "11:30", "pendiente", "Partido de voleibol"),
  createReservation(8, 1, 7, "2026-07-06", "18:00", "19:30", "pendiente", "Entrenamiento de voleibol"),
  createReservation(9, 1, 10, "2026-06-28", "19:30", "21:30", "confirmada", "Partido de básquet"),
  createReservation(10, 1, 8, "2026-07-03", "18:30", "20:30", "confirmada", "Partido de básquet"),
  createReservation(11, 1, 9, "2026-07-05", "15:30", "17:30", "pendiente", "Partido de básquet"),
  createReservation(12, 1, 11, "2026-07-07", "20:00", "21:30", "pendiente", "Entrenamiento de básquet"),
];
