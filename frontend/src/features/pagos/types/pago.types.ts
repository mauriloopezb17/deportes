export type PagoEstado = "Al día" | "Pendiente" | "Moroso" | "Exonerado/Beca";

export interface PagoRow {
  id_pago: number;
  id_deportista: number;
  deportista: string;
  ci: string;
  disciplina: string;
  categoria: string;
  tipo_deportista: string;
  mes_correspondiente: string;
  gestion: number;
  monto_actual: number;
  monto_pagado: number;
  deuda: number;
  estado: PagoEstado;
  estado_factura: "Activa" | "Anulada" | "Pendiente";
  fecha_pago?: string;
}

export interface PagoFilters {
  search: string;
  disciplina: string;
  categoria: string;
  mes: string;
  estado: string;
  tipo: string;
}