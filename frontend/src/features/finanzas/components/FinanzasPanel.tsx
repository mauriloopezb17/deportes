import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, CheckCircle, Clock, Wallet } from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"
import { apiFetch } from "../../../utils/api"
import "./FinanzasPanel.css"

type EstadoPago = "Al día" | "Pendiente" | "Moroso" | "Exonerado/Beca"

interface PagoRow {
  id_pago: number
  id_deportista: number
  deportista: string
  ci: string
  disciplina: string
  categoria: string
  tipo_deportista: string
  mes_correspondiente: string
  gestion: number
  monto_actual: number
  monto_pagado: number
  deuda: number
  estado: EstadoPago
  estado_factura: string
  fecha_pago?: string
}

const pagosMock: PagoRow[] = [
  {
    id_pago: 1,
    id_deportista: 1,
    deportista: "Samantha Almanza",
    ci: "14045145",
    disciplina: "Voleibol",
    categoria: "Universitaria",
    tipo_deportista: "Academia",
    mes_correspondiente: "Mayo",
    gestion: 2026,
    monto_actual: 130,
    monto_pagado: 130,
    deuda: 0,
    estado: "Al día",
    estado_factura: "Activa",
    fecha_pago: "2026-05-08",
  },
  {
    id_pago: 2,
    id_deportista: 2,
    deportista: "María López",
    ci: "1234567",
    disciplina: "Básquet",
    categoria: "Universitaria",
    tipo_deportista: "Academia",
    mes_correspondiente: "Mayo",
    gestion: 2026,
    monto_actual: 390,
    monto_pagado: 0,
    deuda: 390,
    estado: "Moroso",
    estado_factura: "Pendiente",
  },
  {
    id_pago: 3,
    id_deportista: 3,
    deportista: "Juan Pérez",
    ci: "7654321",
    disciplina: "Fútbol",
    categoria: "Libre",
    tipo_deportista: "Clase libre",
    mes_correspondiente: "Abril",
    gestion: 2026,
    monto_actual: 130,
    monto_pagado: 0,
    deuda: 130,
    estado: "Pendiente",
    estado_factura: "Pendiente",
  },
  {
    id_pago: 4,
    id_deportista: 4,
    deportista: "Luis Fernández",
    ci: "8877665",
    disciplina: "Futsal",
    categoria: "Competitiva",
    tipo_deportista: "Equipo competitivo",
    mes_correspondiente: "Junio",
    gestion: 2026,
    monto_actual: 0,
    monto_pagado: 0,
    deuda: 0,
    estado: "Exonerado/Beca",
    estado_factura: "Activa",
  },
]

type PagoRaw = Partial<PagoRow> & {
  id?: number
  nombre_deportista?: string
  nombre_completo?: string
  nombres?: string
  ape_paterno?: string
  ape_materno?: string
  nombre_disciplina?: string
  nombre_categoria?: string
  tipo?: string
  estado_pago?: string
  id_deportista_beneficiario?: number
}

function normalizarEstado(value?: string): EstadoPago {
  const estado = value?.toLowerCase()

  if (estado?.includes("moroso")) return "Moroso"
  if (estado?.includes("pendiente")) return "Pendiente"
  if (estado?.includes("exonerado") || estado?.includes("beca")) return "Exonerado/Beca"

  return "Al día"
}

function mapPago(raw: PagoRaw): PagoRow {
  const nombres = raw.nombres ?? ""
  const apePaterno = raw.ape_paterno ?? ""
  const apeMaterno = raw.ape_materno ?? ""

  const nombreArmado = `${nombres} ${apePaterno} ${apeMaterno}`.trim()

const deportista =
  raw.deportista ??
  raw.nombre_deportista ??
  raw.nombre_completo ??
  (nombreArmado || "Deportista sin nombre")

  const montoActual = Number(raw.monto_actual ?? 0)
  const montoPagado = Number(raw.monto_pagado ?? 0)
  const deuda = Number(raw.deuda ?? Math.max(montoActual - montoPagado, 0))

  return {
    id_pago: raw.id_pago ?? raw.id ?? Date.now(),
    id_deportista: raw.id_deportista ?? raw.id_deportista_beneficiario ?? 0,
    deportista,
    ci: String(raw.ci ?? ""),
    disciplina: raw.disciplina ?? raw.nombre_disciplina ?? "Sin disciplina",
    categoria: raw.categoria ?? raw.nombre_categoria ?? "Sin categoría",
    tipo_deportista: raw.tipo_deportista ?? raw.tipo ?? "Academia",
    mes_correspondiente: String(raw.mes_correspondiente ?? ""),
    gestion: Number(raw.gestion ?? new Date().getFullYear()),
    monto_actual: montoActual,
    monto_pagado: montoPagado,
    deuda,
    estado: normalizarEstado(raw.estado ?? raw.estado_pago),
    estado_factura: raw.estado_factura ?? "Pendiente",
    fecha_pago: raw.fecha_pago,
  }
}

function estadoClass(estado: EstadoPago) {
  if (estado === "Al día") return "success"
  if (estado === "Moroso") return "danger"
  if (estado === "Exonerado/Beca") return "info"
  return "warning"
}

function estadoIcon(estado: EstadoPago) {
  if (estado === "Al día") return "✓"
  if (estado === "Moroso") return "⚠"
  if (estado === "Pendiente") return "⏱"
  return "•"
}

function FinanzasPanel() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [pagos, setPagos] = useState<PagoRow[]>([])
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState("Todos")
  const [selectedPago, setSelectedPago] = useState<PagoRow | null>(null)
  const [loadingPagos, setLoadingPagos] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login", { replace: true })
  }, [loading, isAuthenticated, navigate])

  useEffect(() => {
    setLoadingPagos(true)

    apiFetch<PagoRaw[]>("/api/pagos")
      .then((data) => setPagos(data.map(mapPago)))
      .catch((err) => {
        console.warn("Usando pagos mock hasta que el microservicio de finanzas exponga /api/pagos", err)
        //setError("Mostrando datos de ejemplo hasta conectar el microservicio de finanzas.")
        setPagos(pagosMock)
      })
      .finally(() => setLoadingPagos(false))
  }, [])

  const pagosFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase()

    return pagos.filter((pago) => {
      const matchSearch =
        !query ||
        pago.deportista.toLowerCase().includes(query) ||
        pago.ci.includes(query) ||
        pago.disciplina.toLowerCase().includes(query)

      const matchEstado = estado === "Todos" || pago.estado === estado

      return matchSearch && matchEstado
    })
  }, [pagos, search, estado])

  const stats = useMemo(() => {
    return {
      alDia: pagos.filter((pago) => pago.estado === "Al día").length,
      pendientes: pagos.filter((pago) => pago.estado === "Pendiente").length,
      morosos: pagos.filter((pago) => pago.estado === "Moroso").length,
      recaudacion: pagos.reduce((total, pago) => total + pago.monto_pagado, 0),
      deudaTotal: pagos.reduce((total, pago) => total + pago.deuda, 0),
    }
  }, [pagos])

  if (loading || loadingPagos) {
    return (
      <div className="finanzas-panel">
        <div className="finanzas-card">
          <p>Cargando pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="finanzas-panel">
      <section className="finanzas-hero">
        <div>
          <span>Universidad Católica Boliviana</span>
          <h1>Verificación de pagos</h1>
          <p>Control de pagos, deudas y estados mensuales de deportistas inscritos.</p>
        </div>

        <div className="finanzas-hero-icon">
          <Wallet size={38} strokeWidth={1.8} />
        </div>
      </section>

      {error && <div className="finanzas-alert">{error}</div>}

      <section className="finanzas-stats">
        <article className="finanzas-stat">
          <CheckCircle size={24} />
          <span>Al día</span>
          <strong>{stats.alDia}</strong>
        </article>

        <article className="finanzas-stat">
          <Clock size={24} />
          <span>Pendientes</span>
          <strong>{stats.pendientes}</strong>
        </article>

        <article className="finanzas-stat danger">
          <AlertTriangle size={24} />
          <span>Morosos</span>
          <strong>{stats.morosos}</strong>
        </article>

        <article className="finanzas-stat">
          <Wallet size={24} />
          <span>Recaudación</span>
          <strong>Bs. {stats.recaudacion.toLocaleString("es-BO")}</strong>
          <small>Deuda: Bs. {stats.deudaTotal}</small>
        </article>
      </section>

      <section className="finanzas-card">
        <div className="finanzas-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, CI o disciplina"
          />

          <select value={estado} onChange={(event) => setEstado(event.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="Al día">Al día</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Moroso">Moroso</option>
            <option value="Exonerado/Beca">Exonerado/Beca</option>
          </select>
        </div>

        <div className="finanzas-table-wrap">
          <table className="finanzas-table">
            <thead>
              <tr>
                <th>Deportista</th>
                <th>CI</th>
                <th>Disciplina</th>
                <th>Mes</th>
                <th>Estado</th>
                <th>Monto pagado</th>
                <th>Deuda</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id_pago}>
                  <td>
                    <strong>{pago.deportista}</strong>
                    <span>{pago.categoria}</span>
                  </td>
                  <td>{pago.ci}</td>
                  <td>{pago.disciplina}</td>
                  <td>
                    {pago.mes_correspondiente} {pago.gestion}
                  </td>
                  <td>
                    <span className={`finanzas-badge ${estadoClass(pago.estado)}`}>
                      {estadoIcon(pago.estado)} {pago.estado}
                    </span>
                  </td>
                  <td>Bs. {pago.monto_pagado}</td>
                  <td>Bs. {pago.deuda}</td>
                  <td>
                    <button type="button" onClick={() => setSelectedPago(pago)}>
                      Ver cuenta
                    </button>
                  </td>
                </tr>
              ))}

              {pagosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="finanzas-empty">
                    No hay pagos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPago && (
        <div className="finanzas-modal-backdrop">
          <section className="finanzas-modal">
            <button
              className="finanzas-modal-close"
              type="button"
              onClick={() => setSelectedPago(null)}
            >
              ×
            </button>

            <span>Estado de cuenta</span>
            <h2>{selectedPago.deportista}</h2>
            <p>Detalle del pago mensual registrado.</p>

            <div className="finanzas-detail-grid">
              <div>
                <span>CI</span>
                <strong>{selectedPago.ci}</strong>
              </div>

              <div>
                <span>Disciplina</span>
                <strong>{selectedPago.disciplina}</strong>
              </div>

              <div>
                <span>Categoría</span>
                <strong>{selectedPago.categoria}</strong>
              </div>

              <div>
                <span>Mes</span>
                <strong>
                  {selectedPago.mes_correspondiente} {selectedPago.gestion}
                </strong>
              </div>

              <div>
                <span>Monto pagado</span>
                <strong>Bs. {selectedPago.monto_pagado}</strong>
              </div>

              <div>
                <span>Deuda</span>
                <strong>Bs. {selectedPago.deuda}</strong>
              </div>

              <div>
                <span>Estado</span>
                <strong>{selectedPago.estado}</strong>
              </div>

              <div>
                <span>Factura</span>
                <strong>{selectedPago.estado_factura}</strong>
              </div>
            </div>

            <button
              className="finanzas-primary"
              type="button"
              onClick={() => setSelectedPago(null)}
            >
              Cerrar
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default FinanzasPanel