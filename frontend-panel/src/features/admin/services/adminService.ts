import {
  Academia,
  Pago,
  Comunicado,
  HistorialClub,
  PaginatedResponse,
} from "@types";
import { apiClient } from "@/services/api";

const emptyPage = <T>(): PaginatedResponse<T> => ({
  success: true,
  data: [],
  pagination: { total: 0, page: 1, limit: 0, pages: 1 },
});

export const academiaService = {
  async obtenerAcademias(params?: any): Promise<PaginatedResponse<Academia>> {
    void params;
    return emptyPage<Academia>();
  },

  async obtenerAcademia(id: number): Promise<Academia> {
    return { id, nombre: "", director: "", contacto: "", saldo: 0, estado: "inactiva" };
  },

  async crearAcademia(data: Partial<Academia>): Promise<Academia> {
    return { id: Date.now(), saldo: 0, estado: "activa", ...data } as Academia;
  },

  async actualizarAcademia(
    id: number,
    data: Partial<Academia>,
  ): Promise<Academia> {
    return { id, saldo: 0, estado: "activa", ...data } as Academia;
  },

  async eliminarAcademia(id: number): Promise<void> {
    void id;
  },
};

export const pagoService = {
  async obtenerPagos(params?: any): Promise<PaginatedResponse<Pago>> {
    void params;
    return emptyPage<Pago>();
  },

  async obtenerPago(id: number): Promise<Pago> {
    return { id, academia: await academiaService.obtenerAcademia(0), monto: 0, concepto: "", fecha_vencimiento: "", estado: "pendiente" };
  },

  async crearPago(data: Partial<Pago>): Promise<Pago> {
    return { id: Date.now(), academia: await academiaService.obtenerAcademia(0), monto: 0, concepto: "", fecha_vencimiento: "", estado: "pendiente", ...data } as Pago;
  },

  async registrarPago(id: number, fecha: string): Promise<Pago> {
    return { ...(await this.obtenerPago(id)), estado: "pagado", fecha_pago: fecha };
  },

  async obtenerPagosPorAcademia(academiaId: number): Promise<Pago[]> {
    void academiaId;
    return [];
  },
};

export const comunicadoService = {
  async obtenerComunicados(
    params?: any,
  ): Promise<PaginatedResponse<Comunicado>> {
    void params;
    return emptyPage<Comunicado>();
  },

  async obtenerComunicado(id: number): Promise<Comunicado> {
    return { id, titulo: "", contenido: "", fecha_creacion: "", autor: null as any, estado: "borrador" };
  },

  async crearComunicado(data: Partial<Comunicado>): Promise<Comunicado> {
    return { id: Date.now(), titulo: "", contenido: "", fecha_creacion: new Date().toISOString(), autor: null as any, estado: "borrador", ...data } as Comunicado;
  },

  async actualizarComunicado(
    id: number,
    data: Partial<Comunicado>,
  ): Promise<Comunicado> {
    return { ...(await this.obtenerComunicado(id)), ...data };
  },

  async eliminarComunicado(id: number): Promise<void> {
    void id;
  },

  async publicarComunicado(id: number): Promise<Comunicado> {
    return { ...(await this.obtenerComunicado(id)), estado: "publicado" };
  },
};

export const historialService = {
  async obtenerHistorial(
    params?: any,
  ): Promise<PaginatedResponse<HistorialClub>> {
    void params;
    return emptyPage<HistorialClub>();
  },

  async crearRegistroHistorial(
    data: Partial<HistorialClub>,
  ): Promise<HistorialClub> {
    return { id: Date.now(), titulo: "", descripcion: "", fecha: new Date().toISOString(), tipo: "", ...data } as HistorialClub;
  },
};

export const deportistaAdminService = {
  async obtenerCatalogosInscripcion(): Promise<{
    disciplinas: Array<{ id_disciplina: number; nombre_disciplina: string }>;
    categorias: Array<{ id_categoria: number; nombre_categoria: string }>;
  }> {
    const response = await apiClient.get<any>("/admin/catalogos/inscripcion");
    return response.data || { disciplinas: [], categorias: [] };
  },

  async listarDeportistas(): Promise<any[]> {
    const response = await apiClient.get<any[]>("/admin/deportistas");
    return response.data || [];
  },

  async inscribirDeportista(data: any): Promise<any> {
    const response = await apiClient.post<any>("/admin/deportistas/inscribir", data);
    return response.data;
  },
};

export interface RolSistema {
  id_rol: number;
  nombre_rol: string;
  descripcion?: string;
}

export interface CarreraAdmin {
  id_carrera: number;
  nombre: string;
  sigla?: string;
}

export interface RegistrarUsuarioPayload {
  nombres: string;
  ape_paterno: string;
  ape_materno: string;
  fecha_nacimiento: string;
  celular: string;
  ci: string;
  complemento: string | null;
  email: string;
  id_rol: number;
  id_carrera?: number;
  gestion?: string;
}

export const usuarioAdminService = {
  async obtenerRoles(): Promise<RolSistema[]> {
    const response = await apiClient.get<RolSistema[]>("/admin/roles");
    return response.data || [];
  },

  async obtenerCarreras(): Promise<CarreraAdmin[]> {
    const response = await apiClient.get<CarreraAdmin[]>("/admin/carreras");
    return response.data || [];
  },

  async registrarUsuario(payload: RegistrarUsuarioPayload): Promise<any> {
    const response = await apiClient.post<any>(
      "/admin/usuarios/registrar",
      payload,
    );
    return response.data;
  },
};
