import { create } from "zustand";
import { Usuario, UserRole } from "@types";
import { authService } from "@/features/auth/services/authService";
import { twoFactorService } from "@/features/auth/services/twoFactorService";

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
  // Gateo de 2FA: tras validar la password, si el usuario tiene 2FA activo no
  // se inicia sesion hasta verificar el codigo.
  pending2FA: boolean;
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  verify2FA: (codigo: string) => Promise<void>;
  cancel2FA: () => void;
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
  pending2FA: false,
  pendingEmail: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const sesion = await authService.login({
        email: normalizedEmail,
        password,
      });

      // Password correcta. Si el usuario tiene 2FA activo, no persistimos la
      // sesion todavia: pedimos el codigo y verificamos antes de entrar.
      const requiere2FA = await twoFactorService.status(normalizedEmail);
      if (requiere2FA) {
        set({
          pending2FA: true,
          pendingEmail: normalizedEmail,
          isLoading: false,
        });
        return;
      }

      authService.persistSession(sesion);
      set({
        usuario: normalizeUser(sesion.usuario),
        isAuthenticated: true,
        isLoading: false,
        pending2FA: false,
        pendingEmail: null,
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

  verify2FA: async (codigo) => {
    const email = get().pendingEmail;
    if (!email) {
      throw new Error("No hay un inicio de sesion pendiente de verificacion.");
    }
    set({ isLoading: true, error: null });
    try {
      const sesion = await authService.verify2FA(email, codigo);
      authService.persistSession(sesion);
      set({
        usuario: normalizeUser(sesion.usuario),
        isAuthenticated: true,
        isLoading: false,
        pending2FA: false,
        pendingEmail: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Codigo de verificacion incorrecto.";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  cancel2FA: () => {
    set({ pending2FA: false, pendingEmail: null, error: null });
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
