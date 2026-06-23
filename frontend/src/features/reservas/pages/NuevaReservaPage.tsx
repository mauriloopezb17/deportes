import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import ReservaForm from "../components/ReservaForm";

function NuevaReservaPage() {
  const navigate = useNavigate();

  const handleReservaCreada = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-stack nueva-reserva-page">
      <PageHeader
        eyebrow="Universidad Católica Boliviana"
        title="Nueva reserva"
        description="Registra una reserva deportiva y genera automáticamente su comprobante PDF."
        actions={
          <button className="btn btn-ghost" onClick={() => navigate("/reservas")}>
            ← Volver al panel
          </button>
        }
      />

      <ReservaForm onReservaCreada={handleReservaCreada} />
    </div>
  );
}

export default NuevaReservaPage;
