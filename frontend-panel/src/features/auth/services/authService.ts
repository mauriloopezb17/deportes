import { apiClient } from "@/services/api";
import { LoginCredentials, Usuario } from "@types";

export const PREVIEW_TOKEN = "preview-token";

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  carnet: string;
  email: string;
  celular: string;
  password: string;
  rol: "JUGADOR" | "ADMIN" | "DELEGADO";
}

export interface SesionAutenticada {
  token: string;
  usuario: Usuario;
}

// El authService real devuelve { token, user: { id_usuario, nombres, ape_paterno,
// nombre_rol, ... } }. Lo mapeamos al modelo Usuario del panel. Tambien tolera
// la forma { access_token, usuario } por compatibilidad.
const mapUsuario = (raw: any): Usuario => ({
  id: raw?.id ?? raw?.id_usuario,
  persona_id: raw?.persona_id,
  nombre: raw?.nombre ?? raw?.nombres ?? "",
  apellido: raw?.apellido ?? raw?.ape_paterno ?? "",
  email: raw?.email ?? "",
  roles: raw?.roles ?? (raw?.nombre_rol ? [raw.nombre_rol] : []),
  carrera_id: raw?.carrera_id ?? raw?.id_carrera,
});

const toSesion = (payload: any): SesionAutenticada => {
  const data = payload?.data ?? payload ?? {};
  return {
    token: data.token ?? data.access_token,
    usuario: mapUsuario(data.user ?? data.usuario),
  };
};

export const authService = {
  // Valida email + password. NO persiste la sesion: el gateo de 2FA decide
  // (en authStore) si se guarda o si se pide el codigo primero.
  async login(credentials: LoginCredentials): Promise<SesionAutenticada> {
    const normalizedCredentials = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password.trim(),
    };
    const response = await apiClient.post<any>(
      "/auth/login",
      normalizedCredentials,
    );
    return toSesion(response);
  },

  // Verifica el codigo TOTP en el login. El backend devuelve la misma forma que
  // el login ({ token, user }) solo si el codigo es correcto.
  async verify2FA(email: string, codigo: string): Promise<SesionAutenticada> {
    const response = await apiClient.post<any>("/auth/2fa/verificar", {
      email: email.trim().toLowerCase(),
      codigo: codigo.trim(),
    });
    return toSesion(response);
  },

  // Persiste la sesion una vez superado (o no requerido) el 2FA.
  persistSession({ token, usuario }: SesionAutenticada): void {
    apiClient.setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  },

  async logout(): Promise<void> {
    apiClient.clearToken();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },

  startPreview(usuario: Usuario): void {
    apiClient.setToken(PREVIEW_TOKEN);
    localStorage.setItem("token", PREVIEW_TOKEN);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  },

  async register(data: RegisterPayload): Promise<Usuario> {
    const response = await apiClient.post<Usuario>("/auth/register", data);
    return response.data!;
  },

  async getCurrentUser(): Promise<Usuario> {
    const response = await apiClient.get<Usuario>("/auth/profile");
    return response.data!;
  },

  getStoredUser(): Usuario | null {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  isPreview(): boolean {
    return localStorage.getItem("token") === PREVIEW_TOKEN;
  },
};
