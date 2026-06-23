export default function PagosLegend() {
  return (
    <section className="panel-card pagos-legend-card">
      <p className="section-label">Estados de pago</p>

      <div className="pagos-legend-list">
        <div>
          <span>Al día</span>
          <strong className="status-badge success">✓ Al día</strong>
        </div>

        <div>
          <span>Pendiente</span>
          <strong className="status-badge warning">⏱ Pendiente</strong>
        </div>

        <div>
          <span>Moroso</span>
          <strong className="status-badge danger">⚠ Moroso</strong>
        </div>

        <div>
          <span>Exonerado/Beca</span>
          <strong className="status-badge info">Exonerado/Beca</strong>
        </div>
      </div>
    </section>
  );
}