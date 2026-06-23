import { useEffect, useMemo, useState } from "react";
import DeportistaAccount from "../components/DeportistaAccount";
import DeportistaForm from "../components/DeportistaForm";
import DeportistaTable from "../components/DeportistaTable";
import { listarDeportistas, obtenerCatalogosDeportista, registrarDeportista } from "../services/deportistaService";
import type {
  CategoriaOption,
  DeportistaFormData,
  DeportistaRow,
  DisciplinaOption,
  EntrenadorOption,
} from "../types/deportista.types";
import "./RegistroDeportistaPage.css";

export default function RegistroDeportistaPage() {
  const [deportistas, setDeportistas] = useState<DeportistaRow[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaOption[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [entrenadores, setEntrenadores] = useState<EntrenadorOption[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<DeportistaRow | null>(null);

  useEffect(() => {
    listarDeportistas().then(setDeportistas);

    obtenerCatalogosDeportista().then((catalogos) => {
      setDisciplinas(catalogos.disciplinas);
      setCategorias(catalogos.categorias);
      setEntrenadores(catalogos.entrenadores);
    });
  }, []);

  const deportistasFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return deportistas;

    return deportistas.filter((deportista) => {
      return (
        deportista.nombre_completo.toLowerCase().includes(query) ||
        deportista.ci.includes(query) ||
        deportista.disciplina.toLowerCase().includes(query)
      );
    });
  }, [deportistas, search]);

  const stats = useMemo(() => {
    return {
      total: deportistas.length,
      activos: deportistas.filter((item) => item.estado_inscripcion === "Activo").length,
      pendientes: deportistas.filter((item) => item.estado_pago === "Pendiente").length,
      morosos: deportistas.filter((item) => item.estado_pago === "Moroso").length,
    };
  }, [deportistas]);

  async function handleSave(form: DeportistaFormData, openAccount = false) {
    const nuevo = await registrarDeportista(form);
    setDeportistas((prev) => [nuevo, ...prev]);
    setShowForm(false);

    if (openAccount) {
      setSelected(nuevo);
    }
  }

  return (
    <div className="page-stack deportistas-page">
      <section className="page-header deportistas-hero">
        <div className="page-header-copy">
          <p className="page-eyebrow">Universidad Católica Boliviana</p>
          <h1>Registro de deportistas</h1>
          <p>
            Gestión de estudiantes, externos, disciplinas, categorías e inscripción deportiva.
            La pantalla respeta las tablas PERSONAS, DEPORTISTAS e INSCRIPCIONES.
          </p>
        </div>

        <div className="page-header-actions">
          {showForm ? (
            <button className="btn btn-primary" type="button" onClick={() => setShowForm(false)}>
              ✕ Cancelar
            </button>
          ) : (
            <button className="btn btn-primary" type="button" onClick={() => setShowForm(true)}>
              + Nuevo deportista
            </button>
          )}
        </div>
      </section>

      <section className="stats-grid compact">
        <article className="stat-card stat-accent-cyan">
          <span>Deportistas registrados</span>
          <strong>{stats.total}</strong>
          <small>en el sistema</small>
        </article>

        <article className="stat-card stat-accent-green">
          <span>Inscripciones activas</span>
          <strong>{stats.activos}</strong>
          <small>deportistas activos</small>
        </article>

        <article className="stat-card stat-accent-yellow">
          <span>Pagos pendientes</span>
          <strong>{stats.pendientes}</strong>
          <small>por revisar</small>
        </article>

        <article className="stat-card stat-accent-red">
          <span>Morosos</span>
          <strong>{stats.morosos}</strong>
          <small>con deuda</small>
        </article>
      </section>

      {showForm && (
        <DeportistaForm
          disciplinas={disciplinas}
          categorias={categorias}
          entrenadores={entrenadores}
          onCancel={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      <DeportistaTable
        deportistas={deportistasFiltrados}
        search={search}
        onSearch={setSearch}
        onVerCuenta={setSelected}
      />

      <DeportistaAccount deportista={selected} onClose={() => setSelected(null)} />
    </div>
  );
}