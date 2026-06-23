export type TipoDeportista = "Academia" | "Clase libre" | "Equipo competitivo";

export type EstadoInscripcion = "Activo" | "Pendiente" | "Baja";

export type EstadoPago = "Al día" | "Pendiente" | "Moroso";

export interface DisciplinaOption {
  id_disciplina: number;
  nombre_disciplina: string;
}

export interface CategoriaOption {
  id_categoria: number;
  nombre_categoria: string;
}

export interface EntrenadorOption {
  id_entrenador: number;
  nombre_completo: string;
  disciplina: string;
}

export interface DeportistaFormData {
  nombres: string;
  ape_paterno: string;
  ape_materno: string;
  fecha_nacimiento: string;
  celular: string;
  ci: string;
  complemento: string;
  tipo_deportista: TipoDeportista;
  talla_ropa: string;
  id_disciplina: number;
  id_categoria: number;
  id_entrenador?: number;
  fecha_inscripcion: string;
  estado_inscripcion: EstadoInscripcion;
}

export interface DeportistaRow extends DeportistaFormData {
  id_deportista: number;
  nombre_completo: string;
  disciplina: string;
  categoria: string;
  entrenador_asignado: string;
  mes_actual: string;
  estado_pago: EstadoPago;
  deuda: number;
}