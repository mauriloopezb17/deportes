import { useEffect, useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

/* Documentación unificada: un solo /docs con un selector para ver el Swagger
   de todos los microservicios.

   Híbrido vivo/estático (como pidió CoBiNe17):
   - Cada microservicio libera su spec en `${VITE_API_BASE}/api/<slug>/swagger.yaml`
     (el gateway de test.62344037.xyz enruta solo por el slug).
   - Si ese endpoint responde, se usa EN VIVO -> los cambios del backend salen al
     instante, sin drift.
   - Si no responde (o no hay VITE_API_BASE), cae al .yaml estático de public/docs/
     para que /docs nunca quede roto.

   swagger-ui-react no trae el dropdown nativo multi-spec, por eso el <select>. */
const BASE = (import.meta.env.VITE_API_BASE ?? "").trim().replace(/\/+$/, "")

/* slug = como lo expone el gateway. `auth` está confirmado; el resto sigue la
   convención por nombre. Si alguno cambia, es editar el slug acá: igual la
   detección de abajo cae al estático si el endpoint en vivo no responde. */
const SERVICES = [
  { name: "Identidad y Usuarios (auth)", slug: "auth", static: "/docs/auth.yaml" },
  { name: "Portal Web", slug: "portalweb", static: "/docs/portal-web.yaml" },
  { name: "Deportistas e Inscripciones", slug: "deportistas", static: "/docs/deportistas.yaml" },
  { name: "Torneos", slug: "torneos", static: "/docs/torneos.yaml" },
  { name: "Finanzas", slug: "finanzas", static: "/docs/finanzas.yaml" },
  { name: "Infraestructura", slug: "infraestructura", static: "/docs/infraestructura.yaml" },
] as const

function SwaggerViewer() {
  // Arranca en estático; si el endpoint en vivo responde, se reemplaza por el vivo.
  const [resolved, setResolved] = useState<Record<string, string>>(() =>
    Object.fromEntries(SERVICES.map((s) => [s.slug, s.static])),
  )
  const [selected, setSelected] = useState<string>(SERVICES[0].slug)

  useEffect(() => {
    if (!BASE) return // sin base configurada -> todo estático
    let cancelled = false
    SERVICES.forEach(async (s) => {
      const live = `${BASE}/api/${s.slug}/swagger.yaml`
      try {
        const res = await fetch(live)
        if (!cancelled && res.ok) {
          setResolved((prev) => ({ ...prev, [s.slug]: live }))
        }
      } catch {
        /* sin conexión / 404 -> se queda con el estático */
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const url = resolved[selected]

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
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <span style={{ opacity: 0.6, fontSize: 12 }}>
          {url.startsWith("http") ? "· en vivo" : "· estático"}
        </span>
      </div>

      {/* key fuerza el remount del visor al cambiar de spec (o de estático a vivo) */}
      <SwaggerUI key={url} url={url} />
    </div>
  )
}

export default SwaggerViewer
