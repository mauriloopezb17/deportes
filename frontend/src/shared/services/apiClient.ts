import { API_BASE_URL, buildApiUrl } from "../../config/microservices.config";

export const API_URL = API_BASE_URL;
const TOKEN_KEY = "ucb_auth_token";
const BYPASS_AUTH = true;

type RequestOptions = RequestInit & {
  requiresAuth?: boolean;
  baseUrl?: string;
};

function tokenExpirado(): boolean {
  if (BYPASS_AUTH) return false;

  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return true;

    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
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
  if (token) base.Authorization = `Bearer ${token}`;
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
  const { requiresAuth = false, headers, baseUrl, ...rest } = options;

  if (requiresAuth && tokenExpirado()) {
    redirectLogin();
    throw new Error("Sesión expirada");
  }

  const response = await fetch(buildApiUrl(baseUrl ?? API_URL, endpoint), {
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
      throw new Error("Sesión expirada");
    }
    if (response.status === 403) {
      const message = errorData?.message || errorData?.error || "No tienes permisos para realizar esta acción";
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
