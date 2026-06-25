import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Edit2,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Layout } from "@components/layout";
import { Alert, Button, Card, Input, Modal, Select, Table } from "@components/common";
import { jugadorService, personaService } from "@/features/players/services/playerService";
import { equipoService } from "@/features/teams/services/equipoService";
import { Equipo, Persona, UserRole } from "@types";

const emptyForm = {
  nombre: "",
  apellido: "",
  carnet: "",
  email: "",
  celular: "",
  equipo_id: "",
};

const canAppearAsPlayer = (persona: Persona, equipo?: string) => {
  const roles = persona.roles || [];
  const isAdminOrDelegate = roles.some((role) =>
    [UserRole.ADMIN, UserRole.DELEGADO].includes(role),
  );
  const isPlayer = roles.includes(UserRole.JUGADOR) || Boolean(equipo && equipo !== "-");

  return isPlayer && !isAdminOrDelegate;
};

const getPlayerDocument = (persona: Persona) =>
  (persona as any).carnet ?? persona.cedula ?? "Sin registro";

const getPlayerPhone = (persona: Persona) =>
  (persona as any).celular ?? persona.telefono ?? "Sin celular";

const PlayersPage: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposPorJugador, setEquiposPorJugador] = useState<Record<number, string>>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const [response, equiposResponse] = await Promise.all([
        personaService.obtenerPersonas(),
        equipoService.obtenerEquipos(),
      ]);

      setEquipos(equiposResponse.data);

      const relaciones = await Promise.all(
        response.data.map(async (persona) => {
          const equiposJugador = await jugadorService.obtenerEquiposPorJugador(
            persona.id,
          );
          return [persona.id, equiposJugador[0]?.nombre ?? "-"] as const;
        }),
      );
      const equiposPorPersona = Object.fromEntries(relaciones);

      setPersonas(
        response.data.filter((persona) =>
          canAppearAsPlayer(persona, equiposPorPersona[persona.id]),
        ),
      );
      setEquiposPorJugador(equiposPorPersona);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return personas.filter((persona) => {
      const teamName = equiposPorJugador[persona.id] ?? "-";
      const searchableText = [
        persona.nombre,
        persona.apellido,
        persona.email,
        getPlayerPhone(persona),
        getPlayerDocument(persona),
        teamName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesTeam = !teamFilter || teamName === teamFilter;

      return matchesSearch && matchesTeam;
    });
  }, [equiposPorJugador, personas, searchTerm, teamFilter]);

  const teamOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        personas
          .map((persona) => equiposPorJugador[persona.id])
          .filter((teamName): teamName is string => Boolean(teamName && teamName !== "-")),
      ),
    );

    return names.sort().map((teamName) => ({
      value: teamName,
      label: teamName,
    }));
  }, [equiposPorJugador, personas]);

  const playersWithTeam = personas.filter(
    (persona) => (equiposPorJugador[persona.id] ?? "-") !== "-",
  ).length;
  const playersWithoutTeam = Math.max(personas.length - playersWithTeam, 0);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = async (persona: Persona) => {
    const equiposJugador = await jugadorService.obtenerEquiposPorJugador(persona.id);

    setEditingId(persona.id);
    setFormError(null);
    setFormData({
      nombre: persona.nombre ?? "",
      apellido: persona.apellido ?? "",
      carnet: getPlayerDocument(persona) === "Sin registro" ? "" : getPlayerDocument(persona),
      email: persona.email ?? "",
      celular: getPlayerPhone(persona) === "Sin celular" ? "" : getPlayerPhone(persona),
      equipo_id: equiposJugador[0]?.id ? String(equiposJugador[0].id) : "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Eliminar jugador?")) return;
    await personaService.eliminarPersona(id);
    setPersonas((current) => current.filter((persona) => persona.id !== id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const equipoId = formData.equipo_id ? Number(formData.equipo_id) : undefined;
    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      carnet: formData.carnet.trim(),
      email: formData.email.trim().toLowerCase(),
      celular: formData.celular.trim(),
    };

    const duplicatedPlayer = personas.find((persona) => {
      if (editingId && persona.id === editingId) return false;

      return (
        persona.email?.trim().toLowerCase() === payload.email ||
        getPlayerDocument(persona).trim() === payload.carnet
      );
    });

    if (duplicatedPlayer) {
      const duplicateField =
        duplicatedPlayer.email?.trim().toLowerCase() === payload.email
          ? "email"
          : "carnet";
      setFormError(`Ya existe un jugador registrado con ese ${duplicateField}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await personaService.actualizarPersona(editingId, payload);
        await personaService.asignarRolJugador(editingId);
        await jugadorService.asignarJugadorAEquipo(editingId, equipoId);
      } else {
        const created = await personaService.crearPersona(payload);
        await personaService.asignarRolJugador(created.id);
        await jugadorService.asignarJugadorAEquipo(created.id, equipoId);
      }

      setIsModalOpen(false);
      await loadPlayers();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 409
          ? "El email o carnet ya esta registrado"
          : "No se pudo guardar el jugador");
      setFormError(Array.isArray(message) ? message.join(". ") : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlayerName = (record: Persona) => {
    const initials = `${record.nombre?.[0] ?? ""}${record.apellido?.[0] ?? ""}`
      .trim()
      .toUpperCase();

    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
          {initials || <UserRound size={18} />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">
            {record.nombre} {record.apellido}
          </p>
          <p className="truncate text-xs text-gray-500">
            CI {getPlayerDocument(record)}
          </p>
        </div>
      </div>
    );
  };

  const renderTeamBadge = (teamName: string) =>
    teamName !== "-" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <BadgeCheck size={14} />
        {teamName}
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Sin equipo
      </span>
    );

  const columns = [
    {
      key: "nombre",
      title: "Jugador",
      render: (_value: unknown, record: Persona) => renderPlayerName(record),
    },
    {
      key: "email",
      title: "Contacto",
      render: (_value: unknown, record: Persona) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-700">
            <Mail size={14} className="text-gray-400" />
            <span>{record.email || "Sin email"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Phone size={14} className="text-gray-400" />
            <span>{getPlayerPhone(record)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "equipo",
      title: "Equipo",
      render: (_value: unknown, record: Persona) =>
        renderTeamBadge(equiposPorJugador[record.id] ?? "-"),
    },
    {
      key: "acciones",
      title: "Acciones",
      render: (_value: unknown, record: Persona) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void openEdit(record)}
            aria-label="Editar jugador"
            title="Editar jugador"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(record.id)}
            aria-label="Eliminar jugador"
            title="Eliminar jugador"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
              Participantes
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Gestion de Jugadores
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Administra los datos de contacto y la asignacion de equipos de cada
              jugador registrado.
            </p>
          </div>
          <Button variant="primary" onClick={openCreate} className="gap-2">
            <Plus size={20} />
            Nuevo Jugador
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-primary-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Jugadores activos
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {personas.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <UsersRound size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Con equipo
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {playersWithTeam}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Sin asignar
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {playersWithoutTeam}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <UserRound size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, carnet, email o equipo"
                className="pl-10"
                aria-label="Buscar jugadores"
                fullWidth
              />
            </div>
            <Select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              options={teamOptions}
              aria-label="Filtrar por equipo"
              fullWidth
            />
          </div>
        </div>

        {!isLoading && filteredPlayers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Search size={26} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No se encontraron jugadores
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Ajusta la busqueda o limpia el filtro de equipo para ver mas
              resultados.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredPlayers.map((persona) => {
                const teamName = equiposPorJugador[persona.id] ?? "-";

                return (
                  <Card key={persona.id} hoverable className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {renderPlayerName(persona)}
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void openEdit(persona)}
                          aria-label="Editar jugador"
                          title="Editar jugador"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(persona.id)}
                          aria-label="Eliminar jugador"
                          title="Eliminar jugador"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        <span className="min-w-0 truncate">
                          {persona.email || "Sin email"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <span>{getPlayerPhone(persona)}</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      {renderTeamBadge(teamName)}
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Lista completa
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredPlayers.length} resultado
                    {filteredPlayers.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <Table
                columns={columns}
                data={filteredPlayers}
                isLoading={isLoading}
              />
            </Card>
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setFormError(null);
            setIsModalOpen(false);
          }}
          title={editingId ? "Editar Jugador" : "Nuevo Jugador"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert
                type="warning"
                message={formError}
                onClose={() => setFormError(null)}
                closable
              />
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(event) =>
                  setFormData({ ...formData, nombre: event.target.value })
                }
                required
              />
              <Input
                label="Apellido"
                value={formData.apellido}
                onChange={(event) =>
                  setFormData({ ...formData, apellido: event.target.value })
                }
                required
              />
            </div>
            <Input
              label="Carnet"
              value={formData.carnet}
              onChange={(event) =>
                setFormData({ ...formData, carnet: event.target.value })
              }
              fullWidth
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              fullWidth
              required
            />
            <Input
              label="Celular"
              value={formData.celular}
              onChange={(event) =>
                setFormData({ ...formData, celular: event.target.value })
              }
              fullWidth
              required
            />
            <Select
              label="Equipo"
              value={formData.equipo_id}
              onChange={(event) =>
                setFormData({ ...formData, equipo_id: event.target.value })
              }
              options={equipos.map((equipo) => ({
                value: equipo.id,
                label: equipo.nombre,
              }))}
              fullWidth
            />
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setFormError(null);
                  setIsModalOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                {editingId ? "Actualizar" : "Crear"} Jugador
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default PlayersPage;
