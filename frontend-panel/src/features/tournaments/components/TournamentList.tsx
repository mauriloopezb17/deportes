import React, { useEffect, useMemo, useState } from "react";
import { useTournamentStore } from "@/features/tournaments/stores/tournamentStore";
import { Button, Input, Select, Modal, Card } from "@components/common";
import { Torneo } from "@types";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit2,
  Filter,
  Plus,
  Search,
  Trash2,
  Trophy,
} from "lucide-react";
import { disciplinaService } from "@/features/disciplines/services/disciplinaService";

const estadoOptions = [
  { value: "planeado", label: "Planeado" },
  { value: "en_curso", label: "En curso" },
  { value: "finalizado", label: "Finalizado" },
];

const tipoOptions = [
  { value: "Interno", label: "Interno" },
  { value: "Externo", label: "Externo" },
];

const estadoStyles = {
  planeado: "bg-slate-100 text-slate-700 border-slate-200",
  en_curso: "bg-blue-100 text-blue-800 border-blue-200",
  finalizado: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTorneoTipo = (torneo: Torneo) =>
  (torneo as any).tipo ?? torneo.descripcion ?? "Interno";

const getDisciplinaId = (torneo: Torneo) =>
  String((torneo as any).disciplina_id ?? torneo.disciplina?.id ?? "");

const getEstadoLabel = (estado: Torneo["estado"]) =>
  estadoOptions.find((option) => option.value === estado)?.label ?? estado;

const TournamentList: React.FC = () => {
  const { torneos, isLoading, obtenerTorneos, obtenerTorneo, eliminarTorneo } =
    useTournamentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [disciplinaFilter, setDisciplinaFilter] = useState("todas");

  useEffect(() => {
    obtenerTorneos();
  }, [obtenerTorneos]);

  const disciplinas = useMemo(() => {
    const map = new Map<string, string>();

    torneos.forEach((torneo) => {
      const id = getDisciplinaId(torneo);
      const name = torneo.disciplina?.nombre;
      if (id && name) map.set(id, name);
    });

    return [...map.entries()].map(([id, nombre]) => ({ id, nombre }));
  }, [torneos]);

  const filteredTorneos = useMemo(
    () =>
      torneos.filter((torneo) => {
        const matchesSearch = `${torneo.nombre} ${torneo.disciplina?.nombre ?? ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesEstado =
          estadoFilter === "todos" || torneo.estado === estadoFilter;
        const matchesDisciplina =
          disciplinaFilter === "todas" ||
          getDisciplinaId(torneo) === disciplinaFilter;

        return matchesSearch && matchesEstado && matchesDisciplina;
      }),
    [disciplinaFilter, estadoFilter, searchTerm, torneos],
  );

  const metrics = useMemo(
    () => ({
      total: torneos.length,
      active: torneos.filter((torneo) => torneo.estado === "en_curso").length,
      planned: torneos.filter((torneo) => torneo.estado === "planeado").length,
      finished: torneos.filter((torneo) => torneo.estado === "finalizado").length,
    }),
    [torneos],
  );

  const openCreate = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = async (id: number) => {
    await obtenerTorneo(id);
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Eliminar este torneo y sus datos asociados?")) {
      try {
        await eliminarTorneo(id);
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
        <div className="h-1.5 bg-[var(--color-yellow)]" />
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
              Gestion competitiva
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Gestion de Torneos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              Administra torneos por disciplina, estado, fechas y tipo de
              competencia desde una vista preparada para seguimiento.
            </p>
          </div>
          <Button variant="primary" onClick={openCreate} className="gap-2">
            <Plus size={20} />
            Nuevo Torneo
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Total"
          value={metrics.total}
          icon={<Trophy size={20} />}
          className="border-sky-200 bg-sky-50 text-sky-900"
        />
        <MetricCard
          label="En curso"
          value={metrics.active}
          icon={<Clock size={20} />}
          className="border-blue-200 bg-blue-50 text-blue-900"
        />
        <MetricCard
          label="Planeados"
          value={metrics.planned}
          icon={<CalendarDays size={20} />}
          className="border-slate-200 bg-slate-50 text-slate-900"
        />
        <MetricCard
          label="Finalizados"
          value={metrics.finished}
          icon={<CheckCircle2 size={20} />}
          className="border-emerald-200 bg-emerald-50 text-emerald-900"
        />
      </div>

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <Input
            label="Buscar torneo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre o disciplina"
            fullWidth
          />
          <Select
            label="Estado"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            options={[
              { value: "todos", label: "Todos" },
              ...estadoOptions,
            ]}
          />
          <Select
            label="Disciplina"
            value={disciplinaFilter}
            onChange={(e) => setDisciplinaFilter(e.target.value)}
            options={[
              { value: "todas", label: "Todas" },
              ...disciplinas.map((disciplina) => ({
                value: disciplina.id,
                label: disciplina.nombre,
              })),
            ]}
          />
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm("");
              setEstadoFilter("todos");
              setDisciplinaFilter("todas");
            }}
          >
            <Filter size={18} />
            Limpiar
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-300 border-t-primary-600" />
        </div>
      ) : filteredTorneos.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Search className="mx-auto text-gray-400" size={36} />
            <p className="mt-3 font-semibold text-gray-700">
              No se encontraron torneos
            </p>
            <p className="text-sm text-gray-500">
              Ajusta los filtros o registra un nuevo torneo.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTorneos.map((torneo) => (
            <TournamentCard
              key={torneo.id}
              torneo={torneo}
              onEdit={() => openEdit(torneo.id)}
              onDelete={() => handleDelete(torneo.id)}
            />
          ))}
        </div>
      )}

      <TournamentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={editingId}
      />
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  className,
}) => (
  <div className={`rounded-lg border p-4 ${className}`}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold uppercase">{label}</span>
      {icon}
    </div>
    <p className="mt-3 text-3xl font-bold">{value}</p>
  </div>
);

interface TournamentCardProps {
  torneo: Torneo;
  onEdit: () => void;
  onDelete: () => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  torneo,
  onEdit,
  onDelete,
}) => {
  const estadoClass =
    estadoStyles[torneo.estado] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <Card hoverable>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estadoClass}`}>
              {getEstadoLabel(torneo.estado)}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
              {getTorneoTipo(torneo)}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-950">{torneo.nombre}</h2>
          <p className="mt-2 text-sm text-gray-500">
            {torneo.disciplina?.nombre || "Sin disciplina asignada"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Edit2 size={16} />
          </Button>
          <Button size="sm" variant="danger" onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <InfoTile label="Inicio" value={formatDate(torneo.fecha_inicio)} />
        <InfoTile label="Fin" value={formatDate(torneo.fecha_fin)} />
        <InfoTile
          label="Equipos"
          value={torneo.equipos?.length ? `${torneo.equipos.length}` : "0"}
        />
      </div>
    </Card>
  );
};

interface InfoTileProps {
  label: string;
  value: string;
}

const InfoTile: React.FC<InfoTileProps> = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
    <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
    <p className="mt-1 font-semibold text-gray-900">{value}</p>
  </div>
);

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: number | null;
}

const TournamentFormModal: React.FC<TournamentFormModalProps> = ({
  isOpen,
  onClose,
  editingId,
}) => {
  const { crearTorneo, actualizarTorneo, torneo } = useTournamentStore();
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Interno");
  const [estado, setEstado] = useState<Torneo["estado"]>("planeado");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [disciplinas, setDisciplinas] = useState<
    Array<{ id: number; nombre: string }>
  >([]);

  useEffect(() => {
    const loadOptions = async () => {
      const response = await disciplinaService.obtenerDisciplinas();
      setDisciplinas(response.data);
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingId && torneo) {
      setNombre(torneo.nombre);
      setTipo(getTorneoTipo(torneo));
      setEstado(torneo.estado);
      setDisciplinaId(getDisciplinaId(torneo));
      setFechaInicio(torneo.fecha_inicio ?? "");
      setFechaFin(torneo.fecha_fin ?? "");
      setImagenUrl((torneo as any).imagen_url ?? "");
    } else {
      setNombre("");
      setTipo("Interno");
      setEstado("planeado");
      setDisciplinaId("");
      setFechaInicio("");
      setFechaFin("");
      setImagenUrl("");
    }
  }, [editingId, torneo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre,
      tipo,
      descripcion: tipo,
      estado,
      disciplina_id: Number(disciplinaId),
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
      imagen_url: imagenUrl || undefined,
    } as Partial<Torneo>;

    try {
      if (editingId) {
        await actualizarTorneo(editingId, payload);
      } else {
        await crearTorneo(payload);
      }
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "Editar Torneo" : "Nuevo Torneo"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del torneo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Interfacultades 2026"
          fullWidth
          required
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            options={tipoOptions}
            fullWidth
            required
          />
          <Select
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as Torneo["estado"])}
            options={estadoOptions}
            fullWidth
          />
        </div>

        <Select
          label="Disciplina"
          value={disciplinaId}
          onChange={(e) => setDisciplinaId(e.target.value)}
          options={disciplinas.map((disciplina) => ({
            value: disciplina.id,
            label: disciplina.nombre,
          }))}
          fullWidth
          required
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Fecha de inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            fullWidth
          />
          <Input
            label="Fecha de fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            fullWidth
          />
        </div>

        <Input
          label="Imagen del torneo"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          placeholder="https://..."
          helperText="Opcional. Puede usarse para afiches o portadas del torneo."
          fullWidth
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {editingId ? "Actualizar" : "Crear"} Torneo
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TournamentList;
