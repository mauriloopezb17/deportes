import { create } from "zustand";
import { Usuario, UserRole } from "@types";
import { authService } from "@/features/auth/services/authService";

const normalizeRole = (role: string): UserRole | string => {
  const value = String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (value.includes("ADMIN")) return UserRole.ADMIN;
  if (value.includes("DELEGADO")) return UserRole.DELEGADO;
  if (value.includes("ENTRENADOR")) return UserRole.ENTRENADOR;
  if (value.includes("JUGADOR")) return UserRole.JUGADOR;
  if (value.includes("ESTUDIANTE")) return UserRole.ESTUDIANTE;

  return value;
};

const normalizeUser = (usuario: Usuario | null): Usuario | null => {
  if (!usuario) return null;

  return {
    ...usuario,
    roles: (usuario.roles || []).map((role) => normalizeRole(role) as UserRole),
  };
};

const createPreviewUser = (roles: UserRole[]): Usuario => ({
  id: 1,
  nombre: "Vista",
  apellido: roles.includes(UserRole.ADMIN)
    ? "Admin"
    : roles.includes(UserRole.DELEGADO)
      ? "Delegado"
      : roles.includes(UserRole.ENTRENADOR)
        ? "Entrenador"
        : "Temporal",
  email: "preview@gestion-deportiva.local",
  roles,
});

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  setError: (error: string | null) => void;
  hasRole: (rol: UserRole | UserRole[]) => boolean;
  enterPreview: (roles: UserRole[]) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: normalizeUser(authService.getStoredUser()),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      set({
        usuario: normalizeUser(response.usuario),
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al iniciar sesion";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: () => {
    const usuario = normalizeUser(authService.getStoredUser());
    const isAuth = authService.isAuthenticated();
    set({
      usuario,
      isAuthenticated: isAuth,
    });
  },

  setError: (error) => set({ error }),

  hasRole: (roles) => {
    const { usuario } = get();
    if (!usuario) return false;

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const userRoles = usuario.roles.map((role) => normalizeRole(role));
    return rolesArray.some((role) => userRoles.includes(normalizeRole(role)));
  },

  enterPreview: (roles) => {
    const usuario = createPreviewUser(roles);
    authService.startPreview(usuario);
    set({
      usuario,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },
}));
