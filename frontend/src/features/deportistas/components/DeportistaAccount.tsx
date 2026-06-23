import type { DeportistaRow } from "../types/deportista.types";

interface DeportistaAccountProps {
  deportista: DeportistaRow | null;
  onClose: () => void;
}

export default function DeportistaAccount({ deportista, onClose }: DeportistaAccountProps) {
  if (!deportista) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card deportista-account-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>

        <p className="section-label">Estado de cuenta</p>
        <h2>{deportista.nombre_completo}</h2>
        <p>
          Información visual para revisión administrativa. Después se conectará con las tablas
          PAGOS y CONCEPTOS_PAGO.
        </p>

        <div className="account-summary">
          <div>
            <span>CI</span>
            <strong>{deportista.ci}</strong>
          </div>

          <div>
            <span>Disciplina</span>
            <strong>{deportista.disciplina}</strong>
          </div>

          <div>
            <span>Mes actual</span>
            <strong>{deportista.mes_actual}</strong>
          </div>

          <div>
            <span>Deuda</span>
            <strong>Bs. {deportista.deuda}</strong>
          </div>
        </div>

        <div className="soft-alert">
          Estado actual: <strong>{deportista.estado_pago}</strong>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={onClose}>
            Entendido
          </button>
        </div>
      </section>
    </div>
  );
}