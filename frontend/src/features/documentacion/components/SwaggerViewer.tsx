import { useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

/* Documentación unificada: un solo lugar para ver el Swagger de todos los
   microservicios. Los specs viven en public/docs/ (copiados de cada
   backend/<svc>/docs/swagger.yaml) y se eligen con el selector de arriba.
   swagger-ui-react no trae el dropdown nativo de multi-spec (es parte del
   topbar que no incluye), por eso usamos un <select> propio. */
const SERVICES = [
  { name: "Identidad y Usuarios (auth)", url: "/docs/auth.yaml" },
  { name: "Portal Web", url: "/docs/portal-web.yaml" },
  { name: "Deportistas e Inscripciones", url: "/docs/deportistas.yaml" },
  { name: "Torneos", url: "/docs/torneos.yaml" },
  { name: "Finanzas", url: "/docs/finanzas.yaml" },
  { name: "Infraestructura", url: "/docs/infraestructura.yaml" },
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
