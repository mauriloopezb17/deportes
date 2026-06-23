import { categoriasMock, deportistasMock, disciplinasMock, entrenadoresMock } from "../mocks/deportistasMock";
import type { DeportistaFormData, DeportistaRow } from "../types/deportista.types";

const STORAGE_KEY = "ucb_deportistas_demo";

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

export async function listarDeportistas(): Promise<DeportistaRow[]> {
  return delay(readStorage());
}

export async function registrarDeportista(form: DeportistaFormData): Promise<DeportistaRow> {
  const current = readStorage();

  const disciplina = disciplinasMock.find((item) => item.id_disciplina === form.id_disciplina);
  const categoria = categoriasMock.find((item) => item.id_categoria === form.id_categoria);
  const entrenador = entrenadoresMock.find((item) => item.id_entrenador === form.id_entrenador);

  const nuevo: DeportistaRow = {
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

  const updated = [nuevo, ...current];
  writeStorage(updated);

  return delay(nuevo);
}

export async function obtenerCatalogosDeportista() {
  return delay({
    disciplinas: disciplinasMock,
    categorias: categoriasMock,
    entrenadores: entrenadoresMock,
  });
}

export function limpiarDemoDeportistas() {
  localStorage.removeItem(STORAGE_KEY);
}