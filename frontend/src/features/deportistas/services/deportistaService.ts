import { apiRequest } from "../../../shared/services/apiClient";
import { MICROSERVICE_URLS } from "../../../config/microservices.config";
import {
  categoriasMock,
  deportistasMock,
  disciplinasMock,
  entrenadoresMock,
} from "../mocks/deportistasMock";
import type {
  CategoriaOption,
  DeportistaFormData,
  DeportistaRow,
  DisciplinaOption,
  EntrenadorOption,
  EstadoPago,
} from "../types/deportista.types";

const DEPORTISTAS_API_URL = MICROSERVICE_URLS.deportistas;
const DISCIPLINAS_API_URL = MICROSERVICE_URLS.disciplinas;

const STORAGE_KEY = "ucb_deportistas_demo";

type DeportistaRaw = Partial<DeportistaRow> & {
  id?: number;
  id_persona?: number;
  nombre?: string;
  nombre_completo?: string;
  nombres?: string;
  ape_paterno?: string;
  ape_materno?: string;
  ci?: number | string;
  disciplina?: string;
  nombre_disciplina?: string;
  categoria?: string;
  nombre_categoria?: string;
  estado_pago?: EstadoPago | string;
  estado?: string;
  deuda?: number;
};

type CatalogoDisciplinaRaw = {
  id?: number;
  id_disciplina?: number;
  nombre?: string;
  nombre_disciplina?: string;
};

type CatalogoCategoriaRaw = {
  id?: number;
  id_categoria?: number;
  nombre?: string;
  nombre_categoria?: string;
};

type CatalogoEntrenadorRaw = {
  id?: number;
  id_entrenador?: number;
  nombre?: string;
  nombre_completo?: string;
  disciplina?: string;
  nombre_disciplina?: string;
};

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 180);
  });
}

function readStorage(): DeportistaRow[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deportistasMock));
    return deportistasMock;
  }

  try {
    return JSON.parse(raw) as DeportistaRow[];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deportistasMock));
    return deportistasMock;
  }
}

function writeStorage(data: DeportistaRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizarEstadoPago(value?: string): EstadoPago {
  const estado = value?.toLowerCase();

  if (estado?.includes("moroso")) return "Moroso";
  if (estado?.includes("pendiente")) return "Pendiente";
  return "Al día";
}

function mapDeportista(raw: DeportistaRaw): DeportistaRow {
  const nombres = raw.nombres ?? "";
  const apePaterno = raw.ape_paterno ?? "";
  const apeMaterno = raw.ape_materno ?? "";

  const nombreCompleto =
    raw.nombre_completo ??
    raw.nombre ??
    `${nombres} ${apePaterno} ${apeMaterno}`.trim() ??
    "Deportista sin nombre";

  return {
    id_deportista: raw.id_deportista ?? raw.id ?? Date.now(),
    nombres,
    ape_paterno: apePaterno,
    ape_materno: apeMaterno,
    nombre_completo: nombreCompleto,
    fecha_nacimiento: raw.fecha_nacimiento ?? "",
    celular: raw.celular ?? "",
    ci: String(raw.ci ?? ""),
    complemento: raw.complemento ?? "",
    tipo_deportista: raw.tipo_deportista ?? "Academia",
    talla_ropa: raw.talla_ropa ?? "",
    id_disciplina: raw.id_disciplina ?? 0,
    disciplina: raw.disciplina ?? raw.nombre_disciplina ?? "Sin disciplina",
    id_categoria: raw.id_categoria ?? 0,
    categoria: raw.categoria ?? raw.nombre_categoria ?? "Sin categoría",
    id_entrenador: raw.id_entrenador,
    entrenador_asignado: raw.entrenador_asignado ?? "Sin entrenador asignado",
    fecha_inscripcion: raw.fecha_inscripcion ?? "",
    estado_inscripcion: raw.estado_inscripcion ?? "Pendiente",
    mes_actual: raw.mes_actual ?? "Junio",
    estado_pago: normalizarEstadoPago(raw.estado_pago ?? raw.estado),
    deuda: Number(raw.deuda ?? 0),
  };
}

function mapDisciplina(raw: CatalogoDisciplinaRaw): DisciplinaOption {
  return {
    id_disciplina: raw.id_disciplina ?? raw.id ?? 0,
    nombre_disciplina: raw.nombre_disciplina ?? raw.nombre ?? "Sin nombre",
  };
}

function mapCategoria(raw: CatalogoCategoriaRaw): CategoriaOption {
  return {
    id_categoria: raw.id_categoria ?? raw.id ?? 0,
    nombre_categoria: raw.nombre_categoria ?? raw.nombre ?? "Sin nombre",
  };
}

function mapEntrenador(raw: CatalogoEntrenadorRaw): EntrenadorOption {
  return {
    id_entrenador: raw.id_entrenador ?? raw.id ?? 0,
    nombre_completo: raw.nombre_completo ?? raw.nombre ?? "Entrenador sin nombre",
    disciplina: raw.disciplina ?? raw.nombre_disciplina ?? "",
  };
}

function crearDeportistaLocal(form: DeportistaFormData): DeportistaRow {
  const disciplina = disciplinasMock.find((item) => item.id_disciplina === form.id_disciplina);
  const categoria = categoriasMock.find((item) => item.id_categoria === form.id_categoria);
  const entrenador = entrenadoresMock.find((item) => item.id_entrenador === form.id_entrenador);

  return {
    ...form,
    id_deportista: Date.now(),
    nombre_completo: `${form.nombres} ${form.ape_paterno} ${form.ape_materno}`.trim(),
    disciplina: disciplina?.nombre_disciplina ?? "Sin disciplina",
    categoria: categoria?.nombre_categoria ?? "Sin categoría",
    entrenador_asignado: entrenador?.nombre_completo ?? "Sin entrenador asignado",
    mes_actual: "Junio",
    estado_pago: "Pendiente",
    deuda: 0,
  };
}

export async function listarDeportistas(): Promise<DeportistaRow[]> {
  try {
    const raw = await apiRequest<DeportistaRaw[]>("/api/deportistas", {
      requiresAuth: false,
      baseUrl: DEPORTISTAS_API_URL,
    });

    return raw.map(mapDeportista);
  } catch (error) {
    console.warn("Usando deportistas mock hasta que el backend exponga /api/deportistas", error);
    return delay(readStorage());
  }
}

export async function registrarDeportista(form: DeportistaFormData): Promise<DeportistaRow> {
  try {
    const raw = await apiRequest<DeportistaRaw>("/api/deportistas", {
      method: "POST",
      requiresAuth: true,
      baseUrl: DEPORTISTAS_API_URL,
      body: JSON.stringify({
        nombres: form.nombres.trim(),
        ape_paterno: form.ape_paterno.trim(),
        ape_materno: form.ape_materno.trim(),
        fecha_nacimiento: form.fecha_nacimiento,
        celular: form.celular,
        ci: Number(form.ci),
        complemento: form.complemento || null,
        tipo_deportista: form.tipo_deportista,
        talla_ropa: form.talla_ropa || null,
        id_disciplina: form.id_disciplina,
        id_categoria: form.id_categoria,
        id_entrenador: form.id_entrenador ?? null,
        fecha_inscripcion: form.fecha_inscripcion,
        estado_inscripcion: form.estado_inscripcion,
      }),
    });

    return mapDeportista(raw);
  } catch (error) {
    console.warn("Registrando deportista en mock local hasta que exista POST /api/deportistas", error);

    const current = readStorage();
    const nuevo = crearDeportistaLocal(form);
    const updated = [nuevo, ...current];

    writeStorage(updated);
    return delay(nuevo);
  }
}

export async function obtenerCatalogosDeportista() {
  const [disciplinas, categorias, entrenadores] = await Promise.all([
    apiRequest<CatalogoDisciplinaRaw[]>("/api/disciplinas", {
      requiresAuth: false,
      baseUrl: DISCIPLINAS_API_URL,
    })
      .then((raw) => raw.map(mapDisciplina))
      .catch((error) => {
        console.warn("Usando disciplinas mock hasta que exista /api/disciplinas", error);
        return disciplinasMock;
      }),

    apiRequest<CatalogoCategoriaRaw[]>("/api/categorias", {
      requiresAuth: false,
      baseUrl: DEPORTISTAS_API_URL,
    })
      .then((raw) => raw.map(mapCategoria))
      .catch((error) => {
        console.warn("Usando categorías mock hasta que exista /api/categorias", error);
        return categoriasMock;
      }),

    apiRequest<CatalogoEntrenadorRaw[]>("/api/entrenadores", {
      requiresAuth: false,
      baseUrl: DEPORTISTAS_API_URL,
    })
      .then((raw) => raw.map(mapEntrenador))
      .catch((error) => {
        console.warn("Usando entrenadores mock hasta que exista /api/entrenadores", error);
        return entrenadoresMock;
      }),
  ]);

  return {
    disciplinas,
    categorias,
    entrenadores,
  };
}

export function limpiarDemoDeportistas() {
  localStorage.removeItem(STORAGE_KEY);
}