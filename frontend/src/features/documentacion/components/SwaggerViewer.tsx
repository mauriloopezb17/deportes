import { useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

/* Documentación unificada: un solo /docs para ver el Swagger de todos los
   microservicios, elegidos con el selector de arriba.

   Cada servicio usa su endpoint EN VIVO si su URL está configurada en el .env
   (VITE_API_*_URL -> `${url}/api/docs-json`), así los cambios del backend se
   reflejan al instante. Si esa URL no está seteada, cae al yaml estático en
   public/docs/ (copia de backend/<svc>/docs/swagger.yaml) para que /docs nunca
   quede roto. swagger-ui-react no trae el dropdown nativo multi-spec, por eso
   usamos un <select> propio. */
const env = import.meta.env

function specUrl(liveBase: string | undefined, fallback: string): string {
  const base = (liveBase ?? "").trim().replace(/\/+$/, "")
  return base ? `${base}/api/docs-json` : fallback
}

const SERVICES = [
  { name: "Identidad y Usuarios (auth)", url: specUrl(env.VITE_API_AUTH_URL, "/docs/auth.yaml") },
  { name: "Portal Web", url: specUrl(env.VITE_API_PORTAL_WEB_URL, "/docs/portal-web.yaml") },
  { name: "Deportistas e Inscripciones", url: specUrl(env.VITE_API_DEPORTISTAS_URL, "/docs/deportistas.yaml") },
  { name: "Torneos", url: specUrl(env.VITE_API_TORNEOS_URL, "/docs/torneos.yaml") },
  { name: "Finanzas", url: specUrl(env.VITE_API_FINANZAS_URL, "/docs/finanzas.yaml") },
  { name: "Infraestructura", url: specUrl(env.VITE_API_INFRAESTRUCTURA_URL, "/docs/infraestructura.yaml") },
] as const

function SwaggerViewer() {
  const [selected, setSelected] = useState<string>(SERVICES[0].url)

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          background: "#052845",
          color: "#fff",
        }}
      >
        <strong style={{ fontSize: 16 }}>Documentación de la API</strong>
        <span style={{ opacity: 0.7, fontSize: 13 }}>· Microservicio:</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #009DCD",
            background: "#fff",
            color: "#052845",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {SERVICES.map((s) => (
            <option key={s.url} value={s.url}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* key fuerza el remount del visor al cambiar de spec */}
      <SwaggerUI key={selected} url={selected} />
    </div>
  )
}

export default SwaggerViewer
