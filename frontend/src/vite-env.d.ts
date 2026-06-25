/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_AUTH_URL?: string;
  readonly VITE_API_PORTAL_URL?: string;
  readonly VITE_API_PORTAL_WEB_URL?: string;
  readonly VITE_API_TORNEOS_URL?: string;
  readonly VITE_API_DEPORTISTAS_URL?: string;
  readonly VITE_API_FINANZAS_URL?: string;
  readonly VITE_API_INFRAESTRUCTURA_URL?: string;
  readonly VITE_API_RESERVAS_URL?: string;
  readonly VITE_API_DISCIPLINAS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
