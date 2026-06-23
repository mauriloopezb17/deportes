import { apiRequest, API_URL } from "../../../shared/services/apiClient";
import type {
  BloqueOcupado,
  CreateReservaDto,
  DisponibilidadEspacio,
  DisciplinaBasica,
  Espacio,
  Reserva,
  UpdateReservaDto,
} from "../types/reserva.types";

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const HORAS_CALENDARIO = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

type EspacioRaw = Partial<Espacio> & {
  id_espacio?: number;
  nombre_espacio?: string;
  hora_apertura?: string;
  hora_cierre?: string;
};

type DisciplinaRaw = Partial<DisciplinaBasica> & {
  id_disciplina?: number;
  nombre_disciplina?: string;
};

type ReservaRaw = Partial<Reserva> & {
  id_reserva?: number;
  id_espacio?: number;
  espacio?: EspacioRaw | null;
};

type DisponibilidadRaw = Partial<DisponibilidadEspacio> & {
  espacio?: EspacioRaw | DisponibilidadEspacio["espacio"];
};

const espaciosFallback: Espacio[] = [
  {
    id: 1,
    nombre: "Coliseo Polideportivo",
    horario_apertura: "14:00",
    horario_cierre: "18:00",
    activo: true,
  },
  {
    id: 2,
    nombre: "Cancha de Arquitectura",
    horario_apertura: "14:00",
    horario_cierre: "18:00",
    activo: true,
  },
];

const disciplinasFallback: DisciplinaBasica[] = [
  { id: 1, nombre: "Voleibol", activo: true },
  { id: 2, nombre: "Básquetbol", activo: true },
  { id: 3, nombre: "Fútbol", activo: true },
];

const reservasFallback: Reserva[] = [
  {
    id: 1,
    espacio_id: 1,
    nombre_solicitante: "Juan Pérez",
    ci: 7654321,
    complemento: null,
    correo_solicitante: null,
    fecha_reserva: "2026-04-25",
    hora_inicio: "14:00",
    hora_fin: "15:30",
    tipo_reserva: "entrenamiento",
    motivo: "Práctica deportiva",
    estado: "confirmada",
    espacio: espaciosFallback[0],
  },
];

function normalizarHora(hora?: string | null, fallback = "18:00") {
  if (!hora) return fallback;
  return String(hora).slice(0, 5);
}

function normalizarFecha(fecha?: string | null) {
  if (!fecha) return "";
  return String(fecha).slice(0, 10);
}

function mapEspacio(raw: EspacioRaw): Espacio {
  return {
    id: raw.id ?? raw.id_espacio ?? 0,
    nombre: raw.nombre ?? raw.nombre_espacio ?? "Espacio deportivo",
    horario_apertura: normalizarHora(raw.horario_apertura ?? raw.hora_apertura, "14:00"),
    horario_cierre: normalizarHora(raw.horario_cierre ?? raw.hora_cierre, "18:00"),
    activo: raw.activo ?? true,
  };
}

function mapDisciplina(raw: DisciplinaRaw): DisciplinaBasica {
  return {
    id: raw.id ?? raw.id_disciplina ?? 0,
    nombre: raw.nombre ?? raw.nombre_disciplina ?? "Disciplina deportiva",
    activo: raw.activo ?? true,
  };
}

function mapReserva(raw: ReservaRaw): Reserva {
  const espacio = raw.espacio ? mapEspacio(raw.espacio) : null;
  const espacioId = raw.espacio_id ?? raw.id_espacio ?? espacio?.id ?? 0;

  return {
    id: raw.id ?? raw.id_reserva ?? 0,
    espacio_id: espacioId,
    nombre_solicitante: raw.nombre_solicitante ?? "Solicitante",
    ci: Number(raw.ci ?? 0),
    complemento: raw.complemento ?? null,
    correo_solicitante: raw.correo_solicitante ?? null,
    fecha_reserva: normalizarFecha(raw.fecha_reserva),
    hora_inicio: normalizarHora(raw.hora_inicio, "14:00"),
    hora_fin: normalizarHora(raw.hora_fin, "15:00"),
    tipo_reserva: raw.tipo_reserva ?? "reserva",
    motivo: raw.motivo ?? "Reserva deportiva",
    estado: (raw.estado ?? "confirmada").toLowerCase(),
    espacio: espacio ?? espaciosFallback.find((item) => item.id === espacioId) ?? null,
  };
}

function mapDisponibilidad(raw: DisponibilidadRaw): DisponibilidadEspacio {
  const espacio = raw.espacio
    ? "nombre_espacio" in raw.espacio || "id_espacio" in raw.espacio
      ? mapEspacio(raw.espacio as EspacioRaw)
      : raw.espacio
    : undefined;

  return {
    espacio: {
      nombre: espacio?.nombre ?? "Espacio deportivo",
      horario_apertura: normalizarHora(espacio?.horario_apertura, "14:00"),
      horario_cierre: normalizarHora(espacio?.horario_cierre, "18:00"),
    },
    bloques_ocupados: (raw.bloques_ocupados ?? []).map((bloque) => ({
      ...bloque,
      hora_inicio: normalizarHora(bloque.hora_inicio, "14:00"),
      hora_fin: normalizarHora(bloque.hora_fin, "15:00"),
    })),
  };
}

function fechaParaAPI(semanaBase: Date, indiceDia: number): string {
  const anio = semanaBase.getFullYear();
  const mes = semanaBase.getMonth();
  const dia = semanaBase.getDate();
  const fecha = new Date(anio, mes, dia + indiceDia);
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export { fechaParaAPI };

export async function getEspacios(): Promise<Espacio[]> {
  try {
    const data = await apiRequest<EspacioRaw[]>("/api/espacios");
    const espacios = data.map(mapEspacio).filter((espacio) => espacio.id !== 0);
    return espacios.length ? espacios : espaciosFallback;
  } catch (error) {
    console.warn("Usando espacios fallback", error);
    return espaciosFallback;
  }
}

export async function getDisciplinasReserva(): Promise<DisciplinaBasica[]> {
  try {
    const data = await apiRequest<DisciplinaRaw[]>("/api/disciplinas");
    const disciplinas = data.map(mapDisciplina).filter((disciplina) => disciplina.id !== 0);
    return disciplinas.length ? disciplinas : disciplinasFallback;
  } catch (error) {
    console.warn("Usando disciplinas fallback para reserva", error);
    return disciplinasFallback;
  }
}

export async function getDisponibilidad(
  espacioId: number,
  fecha: string,
): Promise<DisponibilidadEspacio> {
  try {
    const data = await apiRequest<DisponibilidadRaw>(
      `/api/horarios-disponibles/${espacioId}?fecha=${fecha}`,
    );
    return mapDisponibilidad(data);
  } catch (error) {
    console.warn("Usando disponibilidad fallback", error);
    const dia = new Date(`${fecha}T12:00:00.000Z`).getUTCDay();
    const bloques: BloqueOcupado[] = [];

    if (espacioId === 1 && dia === 1) {
      bloques.push({
        hora_inicio: "14:00",
        hora_fin: "15:30",
        tipo: "clase",
        motivo: "Clase / entrenamiento",
      });
    }
    if (espacioId === 2 && dia === 2) {
      bloques.push({
        hora_inicio: "15:00",
        hora_fin: "16:30",
        tipo: "clase",
        motivo: "Clase / entrenamiento",
      });
    }
    if (espacioId === 2 && dia === 5) {
      bloques.push({
        hora_inicio: "14:30",
        hora_fin: "16:00",
        tipo: "reserva",
        motivo: "Reserva previa",
      });
    }

    return {
      espacio: {
        nombre:
          espaciosFallback.find((e) => e.id === espacioId)?.nombre || "Espacio",
        horario_apertura: "14:00",
        horario_cierre: "18:00",
      },
      bloques_ocupados: bloques,
    };
  }
}

export async function getReservas(params?: {
  espacioId?: number;
  fecha?: string;
}): Promise<Reserva[]> {
  try {
    const query = new URLSearchParams();
    if (params?.fecha) query.append("fecha", params.fecha);
    if (params?.espacioId) {
      query.append("espacioId", String(params.espacioId));
      query.append("id_espacio", String(params.espacioId));
    }
    query.append("limit", "200");
    const qs = query.toString();
    const endpoint = qs ? `/api/reservas?${qs}` : "/api/reservas";
    const response = await apiRequest<
      | ReservaRaw[]
      | {
          data: ReservaRaw[];
          total: number;
          page: number;
          limit: number;
        }
    >(endpoint, { requiresAuth: true });

    const rawList = Array.isArray(response) ? response : response.data;
    return rawList.map(mapReserva);
  } catch (error) {
    console.warn("Usando reservas fallback", error);
    return reservasFallback.filter((reserva) => {
      const coincideFecha = params?.fecha
        ? reserva.fecha_reserva === params.fecha
        : true;
      const coincideEspacio = params?.espacioId
        ? reserva.espacio_id === params.espacioId
        : true;
      return coincideFecha && coincideEspacio;
    });
  }
}

export async function crearReserva(datos: CreateReservaDto): Promise<Reserva> {
  const raw = await apiRequest<ReservaRaw>("/api/reservas", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({
      ...datos,
      id_espacio: datos.espacio_id,
    }),
  });
  return mapReserva(raw);
}

export async function cancelarReserva(id: number): Promise<Reserva> {
  try {
    const raw = await apiRequest<ReservaRaw>(`/api/reservas/${id}`, {
      method: "PATCH",
      requiresAuth: true,
      body: JSON.stringify({ estado: "cancelada" }),
    });
    return mapReserva(raw);
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    console.warn("No se pudo cancelar la reserva", error);
    throw new Error("No se pudo cancelar la reserva");
  }
}

export async function habilitarReserva(id: number): Promise<Reserva> {
  try {
    const raw = await apiRequest<ReservaRaw>(`/api/reservas/${id}`, {
      method: "PATCH",
      requiresAuth: true,
      body: JSON.stringify({ estado: "confirmada" }),
    });
    return mapReserva(raw);
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    console.warn("No se pudo habilitar la reserva", error);
    throw new Error("No se pudo habilitar la reserva");
  }
}

export async function editarReserva(
  id: number,
  datos: UpdateReservaDto,
): Promise<Reserva> {
  try {
    const raw = await apiRequest<ReservaRaw>(`/api/reservas/${id}`, {
      method: "PATCH",
      requiresAuth: true,
      body: JSON.stringify({
        ...datos,
        ...(datos.espacio_id ? { id_espacio: datos.espacio_id } : {}),
      }),
    });
    return mapReserva(raw);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Error al editar la reserva");
  }
}

export function getComprobanteUrl(id: number): string {
  return `${API_URL}/api/reservas/${id}/comprobante`;
}

export async function descargarComprobanteReserva(
  id: number,
  nombreArchivo: string,
): Promise<void> {
  const token = sessionStorage.getItem("ucb_auth_token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(getComprobanteUrl(id), { headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autorizado para descargar el comprobante PDF.");
    }
    throw new Error("No se pudo descargar el comprobante PDF");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo.endsWith(".pdf")
    ? nombreArchivo
    : `${nombreArchivo}.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
