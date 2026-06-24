/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API. Empty string = same origin (uses the dev proxy). */
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
