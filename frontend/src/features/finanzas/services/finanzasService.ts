/* Finanzas feature — own isolated network layer. No imports from other modules. */
const API_BASE = import.meta.env.VITE_API_FINANZAS_URL ?? import.meta.env.VITE_API_BASE ?? ''

async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ucb_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<T>
}

export type EstadoPago = "Al día" | "Pendiente" | "Moroso" | "Exonerado/Beca"

export interface PagoRow {
  id_pago: number
  id_deportista: number
  deportista: string
  ci: string
  disciplina: string
  categoria: string
  tipo_deportista: string
  mes_correspondiente: string
  gestion: number
  monto_actual: number
  monto_pagado: number
  deuda: number
  estado: EstadoPago
  estado_factura: string
  fecha_pago?: string
}

type PagoRaw = Partial<PagoRow> & {
  id?: number
  nombre_deportista?: string
  nombre_completo?: string
  nombres?: string
  ape_paterno?: string
  ape_materno?: string
  nombre_disciplina?: string
  nombre_categoria?: string
  tipo?: string
  estado_pago?: string
  id_deportista_beneficiario?: number
}

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
]

function normalizarEstado(value?: string): EstadoPago {
  const estado = value?.toLowerCase()

  if (estado?.includes("moroso")) return "Moroso"
  if (estado?.includes("pendiente")) return "Pendiente"
  if (estado?.includes("exonerado") || estado?.includes("beca")) return "Exonerado/Beca"

  return "Al día"
}

export function mapPago(raw: PagoRaw): PagoRow {
  const nombres = raw.nombres ?? ""
  const apePaterno = raw.ape_paterno ?? ""
  const apeMaterno = raw.ape_materno ?? ""

  const nombreArmado = `${nombres} ${apePaterno} ${apeMaterno}`.trim()

const deportista =
  raw.deportista ??
  raw.nombre_deportista ??
  raw.nombre_completo ??
  (nombreArmado || "Deportista sin nombre")

  const montoActual = Number(raw.monto_actual ?? 0)
  const montoPagado = Number(raw.monto_pagado ?? 0)
  const deuda = Number(raw.deuda ?? Math.max(montoActual - montoPagado, 0))

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
  }
}

interface PagosResponse {
  data: PagoRaw[]
  total: number
  page: number
  totalPages: number
}

export const getPagos = () =>
  apiGet<PagosResponse>('/api/pagos').then(res => res.data)
