import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, CheckCircle, Clock, Wallet } from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"
import { getPagos, mapPago, pagosMock, type EstadoPago, type PagoRow } from "../services/finanzasService"
import "./FinanzasPanel.css"

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

    getPagos()
      .then((data) => setPagos(data.map(mapPago)))
      .catch((err) => {
        console.warn("Usando pagos mock hasta que el microservicio de finanzas exponga /api/pagos", err)
        setError("Mostrando datos de ejemplo hasta conectar el microservicio de finanzas.")
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