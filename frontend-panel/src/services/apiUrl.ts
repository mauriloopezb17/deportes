// Ruta relativa: el panel se sirve desde el mismo dominio que el gateway nginx,
// asi que /api resuelve al gateway sin cruzar origins (y sin CORS). Un default
// absoluto apuntando a otro despliegue deja el panel roto si falta el .env.
const DEFAULT_API_URL = "/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

export const withTrailingSlash = (url?: string) => {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }

  const [path, suffix = ""] = url.split(/(?=[?#])/);
  return `${path.replace(/\/+$/, "")}/${suffix}`;
};
