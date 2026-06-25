import { apiClient } from "@/services/api";
import { LoginCredentials, AuthResponse, Usuario } from "@types";

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

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const normalizedCredentials = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password.trim(),
    };
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      normalizedCredentials,
    );
    if (response.data) {
      const usuario = response.data.usuario || response.data.user;
      apiClient.setToken(response.data.access_token);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
    }
    return {
      ...response.data!,
      usuario: response.data!.usuario || response.data!.user,
    };
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
