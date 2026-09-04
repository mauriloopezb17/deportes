// El portal publico vive en la raiz del mismo dominio que el panel (nginx sirve
// / -> portal y /gestion/ -> panel), asi que las rutas relativas siguen al
// despliegue actual. VITE_PORTAL_URL permite apuntar a otro host si algun dia
// se separan. Simetrico a VITE_PANEL_URL en el portal.
const PORTAL_BASE = (import.meta.env.VITE_PORTAL_URL || "").replace(/\/+$/, "");

export const portalUrl = (path = "/") =>
  `${PORTAL_BASE}${path.startsWith("/") ? path : `/${path}`}`;
