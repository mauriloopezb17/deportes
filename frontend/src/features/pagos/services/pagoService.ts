import type { PagoRow } from "../types/pago.types";

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

export async function listarPagos(): Promise<PagoRow[]> {
  return delay(readStorage());
}

export async function marcarPagoComoAlDia(id_pago: number): Promise<PagoRow[]> {
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