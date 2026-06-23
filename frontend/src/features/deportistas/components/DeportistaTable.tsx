import type { DeportistaRow, EstadoPago } from "../types/deportista.types";

interface DeportistaTableProps {
  deportistas: DeportistaRow[];
  search: string;
  onSearch: (value: string) => void;
  onVerCuenta: (deportista: DeportistaRow) => void;
}

function estadoClass(estado: EstadoPago) {
  if (estado === "Al día") return "success";
  if (estado === "Moroso") return "danger";
  return "warning";
}

function estadoIcon(estado: EstadoPago) {
  if (estado === "Al día") return "✓";
  if (estado === "Moroso") return "⚠";
  return "⏱";
}

export default function DeportistaTable({
  deportistas,
  search,
  onSearch,
  onVerCuenta,
}: DeportistaTableProps) {
  return (
    <section className="table-card deportistas-table-card">
      <div className="table-toolbar deportistas-table-toolbar">
        <div>
          <h2>Deportistas registrados</h2>
          <p>Listado conectado a la estructura de personas, deportistas, inscripciones y pagos.</p>
        </div>

        <input
          className="search-input"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar por nombre o CI"
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Deportista</th>
            <th>CI</th>
            <th>Disciplina</th>
            <th>Tipo</th>
            <th>Mes actual</th>
            <th>Estado</th>
            <th>Deuda</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {deportistas.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className="empty-state">
                  <div>
                    <strong>No se encontraron deportistas</strong>
                    <p>Prueba con otro nombre, CI o registra un nuevo deportista.</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            deportistas.map((deportista) => (
              <tr key={deportista.id_deportista}>
                <td>
                  <strong>{deportista.nombre_completo}</strong>
                  <span>{deportista.categoria}</span>
                </td>
                <td>{deportista.ci}{deportista.complemento ? `-${deportista.complemento}` : ""}</td>
                <td>{deportista.disciplina}</td>
                <td>{deportista.tipo_deportista}</td>
                <td>{deportista.mes_actual}</td>
                <td>
                  <span className={`status-badge ${estadoClass(deportista.estado_pago)}`}>
                    {estadoIcon(deportista.estado_pago)} {deportista.estado_pago}
                  </span>
                </td>
                <td>Bs. {deportista.deuda}</td>
                <td>
                  <button
                    className="btn btn-outline small"
                    type="button"
                    onClick={() => onVerCuenta(deportista)}
                  >
                    Ver cuenta
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}