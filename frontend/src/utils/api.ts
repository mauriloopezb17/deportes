export const API_BASE = normalizarBaseUrl(import.meta.env.VITE_API_BASE ?? "")

const AUTH_BASE = normalizarBaseUrl(import.meta.env.VITE_API_AUTH_URL ?? "") || API_BASE
const PORTAL_BASE = normalizarBaseUrl(import.meta.env.VITE_API_PORTAL_WEB_URL ?? "") || API_BASE
const TORNEOS_BASE = normalizarBaseUrl(import.meta.env.VITE_API_TORNEOS_URL ?? "") || API_BASE
const DEPORTISTAS_BASE = normalizarBaseUrl(import.meta.env.VITE_API_DEPORTISTAS_URL ?? "") || API_BASE
const FINANZAS_BASE = normalizarBaseUrl(import.meta.env.VITE_API_FINANZAS_URL ?? "") || API_BASE
const INFRAESTRUCTURA_BASE =
  normalizarBaseUrl(import.meta.env.VITE_API_INFRAESTRUCTURA_URL ?? "") || API_BASE

type ApiRequestOptions = RequestInit & {
  baseUrl?: string
}

function normalizarBaseUrl(value: string): string {
  const cleaned = value.trim()
  if (!cleaned || cleaned === "__RELATIVE__") return ""
  return cleaned.replace(/\/+$/, "")
}

function buildUrl(baseUrl: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath
}

function resolveBaseUrl(path: string, explicitBaseUrl?: string): string {
  if (explicitBaseUrl !== undefined) return normalizarBaseUrl(explicitBaseUrl)

  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/users") ||
    path.startsWith("/api/admin/roles")
  ) {
    return AUTH_BASE
  }

  if (
    path.startsWith("/api/admin/deportistas") ||
    path.startsWith("/api/admin/catalogos") ||
    path.startsWith("/api/deportistas") ||
    path.startsWith("/api/inscripciones")
  ) {
    return DEPORTISTAS_BASE
  }

  if (
    path.startsWith("/api/pagos") ||
    path.startsWith("/api/finanzas") ||
    path.startsWith("/api/conceptos-pago")
  ) {
    return FINANZAS_BASE
  }

  if (
    path.startsWith("/api/torneos") ||
    path.startsWith("/api/partidos") ||
    path.startsWith("/api/equipos")
  ) {
    return TORNEOS_BASE
  }

  if (
    path.startsWith("/api/noticias") ||
    path.startsWith("/api/galeria") ||
    path.startsWith("/api/portal")
  ) {
    return PORTAL_BASE
  }

  if (
    path.startsWith("/api/reservas") ||
    path.startsWith("/api/espacios") ||
    path.startsWith("/api/horarios")
  ) {
    return INFRAESTRUCTURA_BASE
  }

  return API_BASE
}

export function getToken(): string | null {
  return localStorage.getItem("ucb_token")
}

export function clearToken(): void {
  localStorage.removeItem("ucb_token")
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { baseUrl, headers: optionHeaders, ...rest } = options
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(optionHeaders as Record<string, string>),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const resolvedBaseUrl = resolveBaseUrl(path, baseUrl)
  const res = await fetch(buildUrl(resolvedBaseUrl, path), { ...rest, headers })

  if (!res.ok) {
    let message = res.statusText

    try {
      const body = await res.json()
      message = body.error ?? body.message ?? message
    } catch {}

    throw new Error(Array.isArray(message) ? message.join(". ") : message)
  }

  const text = await res.text()
  if (!text) return null as T

  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}