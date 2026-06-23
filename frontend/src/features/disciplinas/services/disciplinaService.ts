import { apiRequest } from "../../../shared/services/apiClient";
import type {
  Disciplina,
  DisciplinaFormData,
  EstadoDisciplina,
} from "../types/disciplina.types";
import { disciplinasMock } from "../mocks/disciplinasMock";

type DisciplinaRaw = {
  id?: number;
  id_disciplina?: number;
  nombre?: string;
  nombre_disciplina?: string;
  activo?: boolean;
  estado?: string;
};

function mapDisciplina(raw: DisciplinaRaw): Disciplina {
  const id = raw.id ?? raw.id_disciplina ?? 0;
  const nombre = raw.nombre ?? raw.nombre_disciplina ?? "Disciplina sin nombre";
  const estadoRaw = raw.estado?.toLowerCase();
  const activa = raw.activo ?? (estadoRaw ? estadoRaw === "activa" : true);

  return {
    id,
    nombre,
    estado: activa ? "activa" : "inactiva",
  };
}

export async function listarDisciplinas(): Promise<Disciplina[]> {
  try {
    const raw = await apiRequest<DisciplinaRaw[]>("/api/disciplinas", {
      requiresAuth: false,
    });
    return raw.map(mapDisciplina);
  } catch (error) {
    console.warn("Usando disciplinas mock hasta que el backend exponga /api/disciplinas", error);
    return disciplinasMock;
  }
}

export async function crearDisciplina(
  data: DisciplinaFormData,
): Promise<Disciplina> {
  const raw = await apiRequest<DisciplinaRaw>("/api/disciplinas", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({
      nombre_disciplina: data.nombre.trim(),
      nombre: data.nombre.trim(),
      activo: data.estado !== "inactiva",
    }),
  });
  return mapDisciplina(raw);
}

export async function actualizarDisciplina(
  id: number,
  data: DisciplinaFormData,
): Promise<Disciplina> {
  const raw = await apiRequest<DisciplinaRaw>(`/api/disciplinas/${id}`, {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify({
      nombre_disciplina: data.nombre.trim(),
      nombre: data.nombre.trim(),
      activo: data.estado !== "inactiva",
    }),
  });
  return mapDisciplina(raw);
}

export async function cambiarEstadoDisciplina(
  id: number,
  estado: EstadoDisciplina,
): Promise<Disciplina> {
  const raw = await apiRequest<DisciplinaRaw>(`/api/disciplinas/${id}/estado`, {
    method: "PATCH",
    requiresAuth: true,
    body: JSON.stringify({ activo: estado === "activa" }),
  });
  return mapDisciplina(raw);
}
