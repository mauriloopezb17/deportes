import PageHeader from "../../../shared/components/PageHeader";
import EmptyState from "../../../shared/components/EmptyState";

function RegistroDeportistaPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Universidad Católica Boliviana"
        title="Registro de deportistas"
        description="La pestaña queda habilitada sin lógica ni conexión al backend."
      />

      <section className="panel-card" style={{ padding: "2.5rem" }}>
        <EmptyState
          title="Módulo en construcción"
          description="ñññ"
        />
      </section>
    </div>
  );
}

export default RegistroDeportistaPage;
