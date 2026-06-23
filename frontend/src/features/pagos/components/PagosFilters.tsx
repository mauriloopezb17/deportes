import type { PagoFilters } from "../types/pago.types";

interface PagosFiltersProps {
  filters: PagoFilters;
  disciplinas: string[];
  categorias: string[];
  meses: string[];
  tipos: string[];
  onChange: (filters: PagoFilters) => void;
}

export default function PagosFilters({
  filters,
  disciplinas,
  categorias,
  meses,
  tipos,
  onChange,
}: PagosFiltersProps) {
  function update<K extends keyof PagoFilters>(key: K, value: PagoFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section className="panel-card pagos-filters-card">
      <p className="section-label">Filtros</p>

      <div className="filters-grid pagos-filters-grid">
        <label className="field">
          <span>Buscar por nombre o CI</span>
          <input
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Buscar..."
          />
        </label>

        <label className="field">
          <span>Disciplina</span>
          <select value={filters.disciplina} onChange={(event) => update("disciplina", event.target.value)}>
            <option value="">Todas</option>
            {disciplinas.map((disciplina) => (
              <option key={disciplina} value={disciplina}>
                {disciplina}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Categoría</span>
          <select value={filters.categoria} onChange={(event) => update("categoria", event.target.value)}>
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Mes</span>
          <select value={filters.mes} onChange={(event) => update("mes", event.target.value)}>
            <option value="">Todos</option>
            {meses.map((mes) => (
              <option key={mes} value={mes}>
                {mes}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Estado</span>
          <select value={filters.estado} onChange={(event) => update("estado", event.target.value)}>
            <option value="">Todos</option>
            <option value="Al día">Al día</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Moroso">Moroso</option>
            <option value="Exonerado/Beca">Exonerado/Beca</option>
          </select>
        </label>

        <label className="field">
          <span>Tipo</span>
          <select value={filters.tipo} onChange={(event) => update("tipo", event.target.value)}>
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}