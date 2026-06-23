import { useMemo, useState } from "react";
import type {
  CategoriaOption,
  DeportistaFormData,
  DisciplinaOption,
  EntrenadorOption,
  EstadoInscripcion,
  TipoDeportista,
} from "../types/deportista.types";

interface DeportistaFormProps {
  disciplinas: DisciplinaOption[];
  categorias: CategoriaOption[];
  entrenadores: EntrenadorOption[];
  onCancel: () => void;
  onSave: (form: DeportistaFormData, openAccount?: boolean) => void;
}

const initialForm: DeportistaFormData = {
  nombres: "",
  ape_paterno: "",
  ape_materno: "",
  fecha_nacimiento: "",
  celular: "",
  ci: "",
  complemento: "",
  tipo_deportista: "Academia",
  talla_ropa: "",
  id_disciplina: 0,
  id_categoria: 0,
  id_entrenador: undefined,
  fecha_inscripcion: "",
  estado_inscripcion: "Pendiente",
};

export default function DeportistaForm({
  disciplinas,
  categorias,
  entrenadores,
  onCancel,
  onSave,
}: DeportistaFormProps) {
  const [form, setForm] = useState<DeportistaFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const entrenadoresFiltrados = useMemo(() => {
    const disciplina = disciplinas.find((item) => item.id_disciplina === form.id_disciplina);

    if (!disciplina) return entrenadores;

    return entrenadores.filter(
      (entrenador) => entrenador.disciplina === disciplina.nombre_disciplina
    );
  }, [disciplinas, entrenadores, form.id_disciplina]);

  function update<K extends keyof DeportistaFormData>(key: K, value: DeportistaFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.nombres.trim()) nextErrors.nombres = "Ingrese nombres.";
    if (!form.ape_paterno.trim()) nextErrors.ape_paterno = "Ingrese apellido paterno.";
    if (!form.fecha_nacimiento) nextErrors.fecha_nacimiento = "Ingrese fecha de nacimiento.";
    if (!form.celular.trim()) nextErrors.celular = "Ingrese celular.";
    if (!form.ci.trim()) nextErrors.ci = "Ingrese CI.";
    if (!form.id_disciplina) nextErrors.id_disciplina = "Seleccione disciplina.";
    if (!form.id_categoria) nextErrors.id_categoria = "Seleccione categoría.";
    if (!form.fecha_inscripcion) nextErrors.fecha_inscripcion = "Ingrese fecha de inscripción.";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function submit(openAccount = false) {
    if (!validate()) return;
    onSave(form, openAccount);
    setForm(initialForm);
  }

  return (
    <section className="panel-card deportista-form-card">
      <div className="form-title-row">
        <div>
          <p className="section-label">Formulario dividido en bloques</p>
          <h2>Registrar nuevo deportista</h2>
        </div>

        <button className="btn btn-primary" type="button" onClick={onCancel}>
          ✕ Cancelar
        </button>
      </div>

      <div className="form-block">
        <h3>A. Datos personales</h3>

        <div className="form-grid">
          <label className="field">
            <span>Nombres</span>
            <input
              value={form.nombres}
              onChange={(event) => update("nombres", event.target.value)}
              placeholder="Ingrese nombres"
            />
            {errors.nombres && <small className="field-error">{errors.nombres}</small>}
          </label>

          <label className="field">
            <span>Apellido paterno</span>
            <input
              value={form.ape_paterno}
              onChange={(event) => update("ape_paterno", event.target.value)}
              placeholder="Ingrese apellido paterno"
            />
            {errors.ape_paterno && <small className="field-error">{errors.ape_paterno}</small>}
          </label>

          <label className="field">
            <span>Apellido materno</span>
            <input
              value={form.ape_materno}
              onChange={(event) => update("ape_materno", event.target.value)}
              placeholder="Ingrese apellido materno"
            />
          </label>

          <label className="field">
            <span>CI</span>
            <input
              value={form.ci}
              onChange={(event) => update("ci", event.target.value.replace(/\D/g, ""))}
              placeholder="Ingrese CI"
            />
            {errors.ci && <small className="field-error">{errors.ci}</small>}
          </label>

          <label className="field">
            <span>Complemento</span>
            <input
              value={form.complemento}
              onChange={(event) => update("complemento", event.target.value.toUpperCase())}
              placeholder="Ej: LP"
              maxLength={5}
            />
          </label>

          <label className="field">
            <span>Celular</span>
            <input
              value={form.celular}
              onChange={(event) => update("celular", event.target.value.replace(/\D/g, ""))}
              placeholder="Ingrese celular"
            />
            {errors.celular && <small className="field-error">{errors.celular}</small>}
          </label>

          <label className="field">
            <span>Fecha de nacimiento</span>
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(event) => update("fecha_nacimiento", event.target.value)}
            />
            {errors.fecha_nacimiento && (
              <small className="field-error">{errors.fecha_nacimiento}</small>
            )}
          </label>

          <label className="field">
            <span>Talla de ropa</span>
            <select
              value={form.talla_ropa}
              onChange={(event) => update("talla_ropa", event.target.value)}
            >
              <option value="">Seleccionar talla</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </label>
        </div>
      </div>

      <div className="form-block">
        <h3>B. Tipo de deportista</h3>

        <div className="radio-row">
          {(["Academia", "Clase libre", "Equipo competitivo"] as TipoDeportista[]).map((tipo) => (
            <label key={tipo}>
              <input
                type="radio"
                name="tipo_deportista"
                checked={form.tipo_deportista === tipo}
                onChange={() => update("tipo_deportista", tipo)}
              />
              {tipo}
            </label>
          ))}
        </div>

        <p className="form-note">
          Se respeta el campo <strong>tipo_deportista</strong> de la tabla DEPORTISTAS.
        </p>
      </div>

      <div className="form-block">
        <h3>C. Datos deportivos</h3>

        <div className="form-grid">
          <label className="field">
            <span>Disciplina</span>
            <select
              value={form.id_disciplina}
              onChange={(event) => update("id_disciplina", Number(event.target.value))}
            >
              <option value={0}>Seleccionar disciplina</option>
              {disciplinas.map((disciplina) => (
                <option key={disciplina.id_disciplina} value={disciplina.id_disciplina}>
                  {disciplina.nombre_disciplina}
                </option>
              ))}
            </select>
            {errors.id_disciplina && <small className="field-error">{errors.id_disciplina}</small>}
          </label>

          <label className="field">
            <span>Categoría</span>
            <select
              value={form.id_categoria}
              onChange={(event) => update("id_categoria", Number(event.target.value))}
            >
              <option value={0}>Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>
            {errors.id_categoria && <small className="field-error">{errors.id_categoria}</small>}
          </label>

          <label className="field">
            <span>Entrenador asignado</span>
            <select
              value={form.id_entrenador ?? 0}
              onChange={(event) => {
                const value = Number(event.target.value);
                update("id_entrenador", value === 0 ? undefined : value);
              }}
            >
              <option value={0}>Sin entrenador asignado</option>
              {entrenadoresFiltrados.map((entrenador) => (
                <option key={entrenador.id_entrenador} value={entrenador.id_entrenador}>
                  {entrenador.nombre_completo}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Fecha de inscripción</span>
            <input
              type="date"
              value={form.fecha_inscripcion}
              onChange={(event) => update("fecha_inscripcion", event.target.value)}
            />
            {errors.fecha_inscripcion && (
              <small className="field-error">{errors.fecha_inscripcion}</small>
            )}
          </label>

          <label className="field full">
            <span>Estado de inscripción</span>
            <select
              value={form.estado_inscripcion}
              onChange={(event) =>
                update("estado_inscripcion", event.target.value as EstadoInscripcion)
              }
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Activo">Activo</option>
              <option value="Baja">Baja</option>
            </select>
          </label>
        </div>
      </div>

      <div className="form-block">
        <h3>D. Botones</h3>

        <div className="deportista-actions-grid">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            Cancelar
          </button>

          <button className="btn btn-primary" type="button" onClick={() => submit(false)}>
            Guardar deportista
          </button>

          <button className="btn btn-soft" type="button" onClick={() => submit(true)}>
            Guardar y ver estado de cuenta
          </button>
        </div>

        <p className="form-note">Luego el administrador podrá revisar pagos directamente.</p>
      </div>
    </section>
  );
}