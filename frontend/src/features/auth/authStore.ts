const TOKEN_KEY = "ucb_auth_token";

// MODO LOCAL PARA INTEGRACIÓN FRONTEND:
// Permite entrar directo al dashboard sin depender todavía del login/back de autenticación.
// Cuando el grupo de autenticación esté listo, cambiar a false.
const BYPASS_AUTH = true;
const LOCAL_USER = {
  nombre: "Administrador local",
  email: "admin.local@ucb.edu.bo",
  rol: "admin",
};

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  if (BYPASS_AUTH) return true;
  const token = getToken();
  if (!token) return false;
  try {
    const payload = parsePayload(token);
    if (payload.exp && Number(payload.exp) * 1000 < Date.now()) {
      clearToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function parsePayload(token: string): Record<string, unknown> {
  const base64 = token.split(".")[1];
  const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}

export function getUserFromToken(): { nombre?: string; email?: string; rol?: string } | null {
  const token = getToken();
  if (!token) return BYPASS_AUTH ? LOCAL_USER : null;
  try {
    const payload = parsePayload(token);
    return {
      nombre: (payload.nombre ?? payload.name ?? payload.sub) as string | undefined,
      email: payload.email as string | undefined,
      rol: (payload.rol ?? payload.role) as string | undefined,
    };
  } catch {
    return BYPASS_AUTH ? LOCAL_USER : null;
  }
}
