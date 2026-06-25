function normalizarBaseUrl(value?: string): string {
  const cleaned = (value ?? "").trim();
  if (!cleaned || cleaned === "__RELATIVE__") return "";
  return cleaned.replace(/\/+$/, "");
}

const gatewayBase = normalizarBaseUrl(
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:4000",
);

const authBase = normalizarBaseUrl(import.meta.env.VITE_API_AUTH_URL) || gatewayBase;
const portalBase =
  normalizarBaseUrl(import.meta.env.VITE_API_PORTAL_WEB_URL) ||
  normalizarBaseUrl(import.meta.env.VITE_API_PORTAL_URL) ||
  gatewayBase;
const torneosBase = normalizarBaseUrl(import.meta.env.VITE_API_TORNEOS_URL) || gatewayBase;
const deportistasBase = normalizarBaseUrl(import.meta.env.VITE_API_DEPORTISTAS_URL) || gatewayBase;
const finanzasBase = normalizarBaseUrl(import.meta.env.VITE_API_FINANZAS_URL) || gatewayBase;
const infraestructuraBase =
  normalizarBaseUrl(import.meta.env.VITE_API_INFRAESTRUCTURA_URL) || gatewayBase;

export const API_BASE_URL = gatewayBase;

export const MICROSERVICE_URLS = {
  auth: authBase,
  portalWeb: portalBase,
  torneos: torneosBase,
  deportistas: deportistasBase,
  finanzas: finanzasBase,
  infraestructura: infraestructuraBase,
  reservas: normalizarBaseUrl(import.meta.env.VITE_API_RESERVAS_URL) || infraestructuraBase,
  disciplinas:
    normalizarBaseUrl(import.meta.env.VITE_API_DISCIPLINAS_URL) ||
    torneosBase ||
    infraestructuraBase,
} as const;

export type MicroserviceKey = keyof typeof MICROSERVICE_URLS;

export function buildApiUrl(baseUrl: string, endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return baseUrl ? `${baseUrl}${normalizedEndpoint}` : normalizedEndpoint;
}
