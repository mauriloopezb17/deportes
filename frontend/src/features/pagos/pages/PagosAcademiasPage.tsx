import { useEffect, useMemo, useState } from "react";
import PagosFilters from "../components/PagosFilters";
import PagosLegend from "../components/PagosLegend";
import { listarPagos, marcarPagoComoAlDia } from "../services/pagoService";
import type { PagoEstado, PagoFilters, PagoRow } from "../types/pago.types";
import "./PagosAcademiasPage.css";

const initialFilters: PagoFilters = {
  search: "",
  disciplina: "",
  categoria: "",
  mes: "",
  estado: "",
  tipo: "",
};

function estadoClass(estado: PagoEstado) {
  if (estado === "Al día") return "success";
  if (estado === "Moroso") return "danger";
  if (estado === "Exonerado/Beca") return "info";
  return "warning";
}

function estadoIcon(estado: PagoEstado) {
  if (estado === "Al día") return "✓";
  if (estado === "Moroso") return "⚠";
  if (estado === "Pendiente") return "⏱";
  return "";
}

export default function PagosAcademiasPage() {
  const [pagos, setPagos] = useState<PagoRow[]>([]);
  const [filters, setFilters] = useState<PagoFilters>(initialFilters);

  useEffect(() => {
    listarPagos().then(setPagos);
  }, []);

  const catalogos = useMemo(() => {
    return {
      disciplinas: Array.from(new Set(pagos.map((pago) => pago.disciplina))),
      categorias: Array.from(new Set(pagos.map((pago) => pago.categoria))),
      meses: Array.from(new Set(pagos.map((pago) => pago.mes_correspondiente))),
      tipos: Array.from(new Set(pagos.map((pago) => pago.tipo_deportista))),
    };
  }, [pagos]);

  const pagosFiltrados = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return pagos.filter((pago) => {
      const matchSearch =
        !search ||
        pago.deportista.toLowerCase().includes(search) ||
        pago.ci.includes(search);

      const matchDisciplina = !filters.disciplina || pago.disciplina === filters.disciplina;
      const matchCategoria = !filters.categoria || pago.categoria === filters.categoria;
      const matchMes = !filters.mes || pago.mes_correspondiente === filters.mes;
      const matchEstado = !filters.estado || pago.estado === filters.estado;
      const matchTipo = !filters.tipo || pago.tipo_deportista === filters.tipo;

      return (
        matchSearch &&
        matchDisciplina &&
        matchCategoria &&
        matchMes &&
        matchEstado &&
        matchTipo
      );
    });
  }, [filters, pagos]);

  const stats = useMemo(() => {
    return {
      alDia: pagos.filter((pago) => pago.estado === "Al día").length,
      pendientes: pagos.filter((pago) => pago.estado === "Pendiente").length,
      morosos: pagos.filter((pago) => pago.estado === "Moroso").length,
      recaudacion: pagos.reduce((total, pago) => total + pago.monto_pagado, 0),
      deudaTotal: pagos.reduce((total, pago) => total + pago.deuda, 0),
    };
  }, [pagos]);

  async function handleMarcarAlDia(id_pago: number) {
    const updated = await marcarPagoComoAlDia(id_pago);
    setPagos(updated);
  }

  return (
    <div className="page-stack pagos-page">
      <section className="page-header pagos-hero">
        <div className="page-header-copy">
          <p className="page-eyebrow">Universidad Católica Boliviana</p>
          <h1>Verificación de pagos de academias</h1>
          <p>
            Control de pagos, deudas y estados mensuales de los deportistas inscritos en academias.
          </p>
        </div>
      </section>

      <section className="stats-grid pagos-stats-grid">
        <article className="stat-card pagos-stat-card">
          <span>Al día</span>
          <strong className="stat-green-text">{stats.alDia}</strong>
          <small>deportistas</small>
          <div className="stat-icon success">✓</div>
        </article>

        <article className="stat-card pagos-stat-card">
          <span>Pendientes</span>
          <strong className="stat-yellow-text">{stats.pendientes}</strong>
          <small>deportistas</small>
          <div className="stat-icon warning">⏱</div>
        </article>

        <article className="stat-card pagos-stat-card">
          <span>Morosos</span>
          <strong className="stat-red-text">{stats.morosos}</strong>
          <small>deportistas</small>
          <div className="stat-icon danger">⚠</div>
        </article>

        <article className="stat-card pagos-stat-card">
          <span>Recaudación registrada</span>
          <strong>Bs. {stats.recaudacion.toLocaleString("es-BO")}</strong>
          <small>Deuda total: Bs. {stats.deudaTotal}</small>
          <div className="stat-icon info">$</div>
        </article>
      </section>

      <PagosFilters
        filters={filters}
        disciplinas={catalogos.disciplinas}
        categorias={catalogos.categorias}
        meses={catalogos.meses}
        tipos={catalogos.tipos}
        onChange={setFilters}
      />

      <PagosLegend />

      <section className="table-card pagos-table-card">
        <div className="table-toolbar pagos-table-toolbar">
          <div>
            <h2>Pagos registrados</h2>
            <p>Listado de pagos por deportista, disciplina, mes y estado.</p>
          </div>

          <button
            className="btn btn-ghost small"
            type="button"
            onClick={() => setFilters(initialFilters)}
          >
            Limpiar filtros
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Deportista</th>
              <th>CI</th>
              <th>Disciplina</th>
              <th>Categoría</th>
              <th>Mes</th>
              <th>Estado</th>
              <th>Monto pagado</th>
              <th>Deuda</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {pagosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div>
                      <strong>No hay pagos con esos filtros</strong>
                      <p>Prueba limpiando los filtros o buscando otro nombre.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              pagosFiltrados.map((pago) => (
                <tr key={pago.id_pago}>
                  <td>
                    <strong>{pago.deportista}</strong>
                    <span>{pago.tipo_deportista}</span>
                  </td>
                  <td>{pago.ci}</td>
                  <td>{pago.disciplina}</td>
                  <td>{pago.categoria}</td>
                  <td>{pago.mes_correspondiente}</td>
                  <td>
                    <span className={`status-badge ${estadoClass(pago.estado)}`}>
                      {estadoIcon(pago.estado)} {pago.estado}
                    </span>
                  </td>
                  <td>Bs. {pago.monto_pagado}</td>
                  <td>Bs. {pago.deuda}</td>
                  <td>
                    {pago.estado === "Al día" || pago.estado === "Exonerado/Beca" ? (
                      <button className="btn btn-outline small" type="button">
                        Ver cuenta
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary small"
                        type="button"
                        onClick={() => handleMarcarAlDia(pago.id_pago)}
                      >
                        Marcar al día
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}