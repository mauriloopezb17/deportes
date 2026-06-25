import { apiRequest } from "../../../shared/services/apiClient";
import { MICROSERVICE_URLS } from "../../../config/microservices.config";
import type { PagoEstado, PagoRow } from "../types/pago.types";

const FINANZAS_API_URL = MICROSERVICE_URLS.finanzas;
const STORAGE_KEY = "ucb_pagos_demo";

export const pagosMock: PagoRow[] = [
  {
    id_pago: 1,
    id_deportista: 1,
    deportista: "Samantha Almanza",
    ci: "14045145",
    disciplina: "Voleibol",
    categoria: "Universitaria",
    tipo_deportista: "Academia",
    mes_correspondiente: "Mayo",
    gestion: 2026,
    monto_actual: 130,
    monto_pagado: 130,
    deuda: 0,
    estado: "Al día",
    estado_factura: "Activa",
    fecha_pago: "2026-05-08",
  },
  {
    id_pago: 2,
    id_deportista: 2,
    deportista: "María López",
    ci: "1234567",
    disciplina: "Básquet",
    categoria: "Universitaria",
    tipo_deportista: "Academia",
    mes_correspondiente: "Mayo",
    gestion: 2026,
    monto_actual: 390,
    monto_pagado: 0,
    deuda: 390,
    estado: "Moroso",
    estado_factura: "Pendiente",
  },
  {
    id_pago: 3,
    id_deportista: 3,
    deportista: "Juan Pérez",
    ci: "7654321",
    disciplina: "Fútbol",
    categoria: "Libre",
    tipo_deportista: "Clase libre",
    mes_correspondiente: "Abril",
    gestion: 2026,
    monto_actual: 130,
    monto_pagado: 0,
    deuda: 130,
    estado: "Pendiente",
    estado_factura: "Pendiente",
  },
  {
    id_pago: 4,
    id_deportista: 4,
    deportista: "Luis Fernández",
    ci: "8877665",
    disciplina: "Futsal",
    categoria: "Competitiva",
    tipo_deportista: "Equipo competitivo",
    mes_correspondiente: "Junio",
    gestion: 2026,
    monto_actual: 0,
    monto_pagado: 0,
    deuda: 0,
    estado: "Exonerado/Beca",
    estado_factura: "Activa",
  },
];

type PagoRaw = Partial<PagoRow> & {
  id?: number;
  id_persona_pago?: number;
  id_deportista_beneficiario?: number;
  nombre_deportista?: string;
  nombre_completo?: string;
  nombres?: string;
  ape_paterno?: string;
  ape_materno?: string;
  nombre_disciplina?: string;
  nombre_categoria?: string;
  tipo?: string;
  estado_pago?: string;
};

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 180);
  });
}

function readStorage(): PagoRow[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pagosMock));
    return pagosMock;
  }

  try {
    return JSON.parse(raw) as PagoRow[];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pagosMock));
    return pagosMock;
  }
}

function writeStorage(data: PagoRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizarEstado(value?: string): PagoEstado {
  const estado = value?.toLowerCase();

  if (estado?.includes("moroso")) return "Moroso";
  if (estado?.includes("pendiente")) return "Pendiente";
  if (estado?.includes("exonerado") || estado?.includes("beca")) return "Exonerado/Beca";
  return "Al día";
}

function mapPago(raw: PagoRaw): PagoRow {
  const nombres = raw.nombres ?? "";
  const apePaterno = raw.ape_paterno ?? "";
  const apeMaterno = raw.ape_materno ?? "";

  const deportista =
    raw.deportista ??
    raw.nombre_deportista ??
    raw.nombre_completo ??
    `${nombres} ${apePaterno} ${apeMaterno}`.trim() ??
    "Deportista sin nombre";

  const montoActual = Number(raw.monto_actual ?? 0);
  const montoPagado = Number(raw.monto_pagado ?? 0);
  const deuda = Number(raw.deuda ?? Math.max(montoActual - montoPagado, 0));

  return {
    id_pago: raw.id_pago ?? raw.id ?? Date.now(),
    id_deportista: raw.id_deportista ?? raw.id_deportista_beneficiario ?? 0,
    deportista,
    ci: String(raw.ci ?? ""),
    disciplina: raw.disciplina ?? raw.nombre_disciplina ?? "Sin disciplina",
    categoria: raw.categoria ?? raw.nombre_categoria ?? "Sin categoría",
    tipo_deportista: raw.tipo_deportista ?? raw.tipo ?? "Academia",
    mes_correspondiente: String(raw.mes_correspondiente ?? ""),
    gestion: Number(raw.gestion ?? new Date().getFullYear()),
    monto_actual: montoActual,
    monto_pagado: montoPagado,
    deuda,
    estado: normalizarEstado(raw.estado ?? raw.estado_pago),
    estado_factura: raw.estado_factura ?? "Pendiente",
    fecha_pago: raw.fecha_pago,
  };
}

export async function listarPagos(): Promise<PagoRow[]> {
  try {
    const raw = await apiRequest<PagoRaw[]>("/api/pagos", {
      requiresAuth: false,
      baseUrl: FINANZAS_API_URL,
    });

    return raw.map(mapPago);
  } catch (error) {
    console.warn("Usando pagos mock hasta que el backend exponga /api/pagos", error);
    return delay(readStorage());
  }
}

export async function marcarPagoComoAlDia(id_pago: number): Promise<PagoRow[]> {
  try {
    await apiRequest<PagoRaw>(`/api/pagos/${id_pago}/marcar-al-dia`, {
      method: "PATCH",
      requiresAuth: true,
      baseUrl: FINANZAS_API_URL,
    });

    return listarPagos();
  } catch (error) {
    console.warn("Actualizando pago en mock local hasta que exista PATCH /api/pagos/:id/marcar-al-dia", error);

    const updated = readStorage().map((pago) => {
      if (pago.id_pago !== id_pago) return pago;

      return {
        ...pago,
        monto_pagado: pago.monto_actual,
        deuda: 0,
        estado: "Al día" as const,
        estado_factura: "Activa" as const,
        fecha_pago: new Date().toISOString().slice(0, 10),
      };
    });

    writeStorage(updated);
    return delay(updated);
  }
}