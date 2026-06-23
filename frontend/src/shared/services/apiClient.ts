const viteApiUrl = import.meta.env.VITE_API_URL;
export const API_URL = viteApiUrl === "__RELATIVE__" ? "" : (viteApiUrl || "http://localhost:4000");
const TOKEN_KEY = "ucb_auth_token";
const BYPASS_AUTH = true;

type RequestOptions = RequestInit & {
  requiresAuth?: boolean;
};

function tokenExpirado(): boolean {
  if (BYPASS_AUTH) return false;

  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return true;

    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return payload.exp && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function authHeaders(requiresAuth: boolean): Record<string, string> {
  const base: Record<string, string> = { "Content-Type": "application/json" };
  if (!requiresAuth) return base;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

function redirectLogin() {
  if (BYPASS_AUTH) return;

  sessionStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login";
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { requiresAuth = false, headers, ...rest } = options;

  if (requiresAuth && tokenExpirado()) {
    redirectLogin();
    throw new Error("Sesi\u00f3n expirada");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: {
      ...authHeaders(requiresAuth),
      ...headers,
    },
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const errorData = data as { message?: string | string[]; error?: string } | null;

    if (response.status === 401) {
      redirectLogin();
      throw new Error("Sesi\u00f3n expirada");
    }
    if (response.status === 403) {
      const message = errorData?.message || errorData?.error || "No tienes permisos para realizar esta acci\u00f3n";
      throw new Error(Array.isArray(message) ? message.join(". ") : message);
    }
    const message =
      errorData?.message || errorData?.error || "Error al consultar el servidor";
    throw new Error(Array.isArray(message) ? message.join(". ") : message);
  }

  return data as T;
}

export function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

export function formatFechaBO(date: Date | string) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const dia = String(parsed.getDate()).padStart(2, "0");
  const mes = String(parsed.getMonth() + 1).padStart(2, "0");
  const anio = parsed.getFullYear();
  return `${dia}/${mes}/${anio}`;
}
