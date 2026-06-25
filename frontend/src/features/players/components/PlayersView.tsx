import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
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
import { deportistaAdminService } from "@/features/admin/services/adminService";
import { Equipo, Persona, UserRole } from "@types";
import { useAuthStore } from "@/features/auth/stores/authStore";

const emptyForm = {
  nombre: "",
  apellido: "",
  carnet: "",
  email: "",
  celular: "",
  equipo_id: "",
};

type DelegateModalMode = "create" | "assign";

const emptyAthleteForm = {
  nombres: "",
  ape_paterno: "",
  ape_materno: "",
  fecha_nacimiento: "",
  ci: "",
  complemento: "",
  celular: "",
  email: "",
  colegio_instituto: "",
  curso: "",
  talla_ropa: "",
  id_disciplina: "",
  id_categoria: "",
  tutor_nombres: "",
  tutor_ape_paterno: "",
  tutor_ape_materno: "",
  tutor_fecha_nacimiento: "",
  tutor_ci: "",
  tutor_complemento: "",
  tutor_celular: "",
  tutor_email: "",
  tutor_rol: "",
  tipo_sangre: "",
  seguro_medico: "",
  enfermedades_padecimientos: "",
  contacto_emergencia_nombre: "",
  contacto_emergencia_telefono: "",
};

const emptyExperience = {
  tipo_participacion: "",
  gestion: "",
  club_sede: "",
  categoria_jugada: "",
};

const optionalSectionClass =
  "border-t border-dashed border-primary-200 pt-4";

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
  const [isExternalFormOpen, setIsExternalFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [delegateModalMode, setDelegateModalMode] =
    useState<DelegateModalMode>("assign");
  const [formData, setFormData] = useState(emptyForm);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedJugadorId, setSelectedJugadorId] = useState("");
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState("");
  const [equiposPorJugador, setEquiposPorJugador] = useState<Record<number, string>>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [athleteForm, setAthleteForm] = useState(emptyAthleteForm);
  const [experiences, setExperiences] = useState([{ ...emptyExperience }]);
  const [disciplinasInscripcion, setDisciplinasInscripcion] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [categoriasInscripcion, setCategoriasInscripcion] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [isSubmittingAthlete, setIsSubmittingAthlete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { usuario, hasRole } = useAuthStore();
  const isDelegado = hasRole(UserRole.DELEGADO) && !hasRole(UserRole.ADMIN);
  const delegadoCarreraId = usuario?.carrera_id;

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const [response, equiposResponse] = await Promise.all([
        personaService.obtenerPersonas(),
        equipoService.obtenerEquipos(),
      ]);

      const equiposDisponibles =
        isDelegado && delegadoCarreraId
          ? equiposResponse.data.filter(
              (equipo) => equipo.carrera_id === delegadoCarreraId,
            )
          : equiposResponse.data;
      setEquipos(equiposDisponibles);

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
        response.data.filter((persona) => {
          const isVisibleByRole = canAppearAsPlayer(
            persona,
            equiposPorPersona[persona.id],
          );
          const isVisibleByCarrera =
            !isDelegado ||
            (Boolean(delegadoCarreraId) &&
              persona.carrera_id === delegadoCarreraId);

          return isVisibleByRole && isVisibleByCarrera;
        }),
      );
      setEquiposPorJugador(equiposPorPersona);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, [delegadoCarreraId, isDelegado]);

  useEffect(() => {
    const loadCatalogosInscripcion = async () => {
      if (isDelegado) return;

      const catalogos = await deportistaAdminService.obtenerCatalogosInscripcion();
      setDisciplinasInscripcion(
        (catalogos.disciplinas || []).map((disciplina) => ({
          id: disciplina.id_disciplina,
          nombre: disciplina.nombre_disciplina,
        })),
      );
      setCategoriasInscripcion(
        (catalogos.categorias || []).map((categoria) => ({
          id: categoria.id_categoria,
          nombre: categoria.nombre_categoria,
        })),
      );
    };

    void loadCatalogosInscripcion();
  }, [isDelegado]);

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
    setFormError(null);
    setPageMessage(null);

    if (isDelegado) {
      setFormData(emptyForm);
      setDelegateModalMode("create");
      setIsModalOpen(true);
      return;
    }

    setAthleteForm(emptyAthleteForm);
    setExperiences([{ ...emptyExperience }]);
    setIsExternalFormOpen(true);
  };

  const openAssign = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setSelectedJugadorId("");
    setSelectedDisciplinaId("");
    setDelegateModalMode("assign");
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

    if (isDelegado && delegateModalMode === "assign") {
      const jugadorId = Number(selectedJugadorId);
      const equipoId = formData.equipo_id ? Number(formData.equipo_id) : undefined;

      if (!jugadorId || !selectedDisciplinaId || !equipoId) {
        setFormError("Selecciona jugador, disciplina y equipo.");
        return;
      }

      const jugador = personas.find((persona) => persona.id === jugadorId);
      const equipoSeleccionado = equipos.find((equipo) => equipo.id === equipoId);

      if (jugador?.carrera_id !== delegadoCarreraId) {
        setFormError("Solo puedes inscribir jugadores de tu carrera.");
        return;
      }

      if (equipoSeleccionado?.carrera_id !== delegadoCarreraId) {
        setFormError("Solo puedes asignar jugadores a equipos de tu carrera.");
        return;
      }

      setIsSubmitting(true);
      try {
        await jugadorService.asignarJugadorAEquipo(jugadorId, equipoId);
        setIsModalOpen(false);
        await loadPlayers();
      } catch (error: any) {
        const message =
          error.response?.data?.message || "No se pudo inscribir el jugador";
        setFormError(Array.isArray(message) ? message.join(". ") : message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const equipoId = formData.equipo_id ? Number(formData.equipo_id) : undefined;
    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      carnet: formData.carnet.trim(),
      email: formData.email.trim().toLowerCase(),
      celular: formData.celular.trim(),
    };

    if (isDelegado && !payload.email.endsWith("@ucb.edu.bo")) {
      setFormError("El correo debe terminar en @ucb.edu.bo.");
      return;
    }

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
      if (isDelegado && equipoId) {
        const equipoSeleccionado = equipos.find((equipo) => equipo.id === equipoId);
        if (equipoSeleccionado?.carrera_id !== delegadoCarreraId) {
          setFormError("Solo puedes asignar jugadores a equipos de tu carrera.");
          return;
        }
      }

      if (editingId) {
        await personaService.actualizarPersona(editingId, payload);
        await personaService.asignarRolJugador(editingId);
        await jugadorService.asignarJugadorAEquipo(editingId, equipoId);
      } else {
        const created = await personaService.crearPersona(payload);
        if (!isDelegado) {
          await personaService.asignarRolJugador(created.id);
          await jugadorService.asignarJugadorAEquipo(created.id, equipoId);
        }
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
    ...(!isDelegado
      ? [
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
        ]
      : []),
  ];

  const disciplinaOptions = Array.from(
    new Map(
      equipos
        .filter((equipo) => equipo.disciplina_id)
        .map((equipo) => [
          equipo.disciplina_id,
          {
            value: equipo.disciplina_id,
            label: equipo.disciplina?.nombre || equipo.categoria,
          },
        ]),
    ).values(),
  );

  const equiposFiltrados = selectedDisciplinaId
    ? equipos.filter(
        (equipo) => String(equipo.disciplina_id) === selectedDisciplinaId,
      )
    : equipos;

  const selectedCategory = categoriasInscripcion.find(
    (categoria) => String(categoria.id) === athleteForm.id_categoria,
  );
  const tutorApplies = useMemo(() => {
    const name = selectedCategory?.nombre?.toLowerCase() || "";
    return /juvenil|infantil|menor|sub|pre|mini|kids/.test(name);
  }, [selectedCategory]);

  const buildAthletePayload = () => {
    const validExperiences = experiences.filter(
      (experience) =>
        experience.tipo_participacion.trim() ||
        experience.gestion.trim() ||
        experience.club_sede.trim() ||
        experience.categoria_jugada.trim(),
    );

    const hasTutor = tutorApplies && athleteForm.tutor_nombres.trim();
    const hasMedical =
      athleteForm.tipo_sangre ||
      athleteForm.seguro_medico ||
      athleteForm.enfermedades_padecimientos ||
      athleteForm.contacto_emergencia_nombre ||
      athleteForm.contacto_emergencia_telefono;

    return {
      deportista: {
        nombres: athleteForm.nombres,
        ape_paterno: athleteForm.ape_paterno,
        ape_materno: athleteForm.ape_materno || "",
        fecha_nacimiento: athleteForm.fecha_nacimiento,
        celular: athleteForm.celular,
        ci: Number(athleteForm.ci),
        complemento: athleteForm.complemento || undefined,
        email: athleteForm.email,
        talla_ropa: athleteForm.talla_ropa || undefined,
        colegio_instituto: athleteForm.colegio_instituto,
        curso: athleteForm.curso,
      },
      inscripcion: {
        id_disciplina: Number(athleteForm.id_disciplina),
        id_categoria: Number(athleteForm.id_categoria),
      },
      ...(hasTutor
        ? {
            tutor: {
              nombres: athleteForm.tutor_nombres,
              ape_paterno: athleteForm.tutor_ape_paterno,
              ape_materno: athleteForm.tutor_ape_materno,
              fecha_nacimiento:
                athleteForm.tutor_fecha_nacimiento || undefined,
              ci: athleteForm.tutor_ci ? Number(athleteForm.tutor_ci) : undefined,
              complemento: athleteForm.tutor_complemento || undefined,
              celular: athleteForm.tutor_celular || undefined,
              email: athleteForm.tutor_email || undefined,
            },
          }
        : {}),
      ...(hasMedical
        ? {
            ficha_medica: {
              tipo_sangre: athleteForm.tipo_sangre || "No especificado",
              seguro_medico: athleteForm.seguro_medico || undefined,
              enfermedades_padecimientos:
                athleteForm.enfermedades_padecimientos || undefined,
              contacto_emergencia_nombre:
                athleteForm.contacto_emergencia_nombre || "No especificado",
              contacto_emergencia_telefono:
                athleteForm.contacto_emergencia_telefono || "No especificado",
            },
          }
        : {}),
      ...(validExperiences.length
        ? {
            experiencias: validExperiences.map((experience) => ({
              tipo_participacion:
                experience.tipo_participacion || "No especificado",
              gestion: Number(experience.gestion || new Date().getFullYear()),
              club_sede: experience.club_sede || "No especificado",
              categoria_jugada: experience.categoria_jugada || undefined,
            })),
          }
        : {}),
    };
  };

  const handleExternalAthleteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setPageMessage(null);

    if (!athleteForm.id_disciplina || !athleteForm.id_categoria) {
      setFormError("Selecciona disciplina y categoria.");
      return;
    }

    if (isDelegado && !athleteForm.email.trim().toLowerCase().endsWith("@ucb.edu.bo")) {
      setFormError("El correo debe terminar en @ucb.edu.bo.");
      return;
    }

    setIsSubmittingAthlete(true);
    try {
      if (isDelegado) {
        await personaService.crearPersona({
          nombre: athleteForm.nombres.trim(),
          apellido: [athleteForm.ape_paterno, athleteForm.ape_materno]
            .filter(Boolean)
            .join(" ")
            .trim(),
          carnet: athleteForm.ci.trim(),
          email: athleteForm.email.trim().toLowerCase(),
          celular: athleteForm.celular.trim(),
        } as any);
      } else {
        await deportistaAdminService.inscribirDeportista(buildAthletePayload());
      }

      setPageMessage(
        isDelegado
          ? "Deportista UCB registrado correctamente."
          : "Jugador inscrito correctamente.",
      );
      setAthleteForm(emptyAthleteForm);
      setExperiences([{ ...emptyExperience }]);
      setIsExternalFormOpen(false);
      await loadPlayers();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "No se pudo inscribir el jugador.";
      setFormError(Array.isArray(message) ? message.join(". ") : message);
    } finally {
      setIsSubmittingAthlete(false);
    }
  };

  if (isExternalFormOpen && !isDelegado) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
            <div className="h-1.5 bg-[var(--color-yellow)]" />
            <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
                  Gestion de Jugadores
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white">
                  {isDelegado ? "Nuevo deportista UCB" : "Nuevo jugador"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                  {isDelegado
                    ? "Registra un deportista UCB con datos completos. El correo debe terminar en @ucb.edu.bo."
                    : "Registra un deportista externo y vincula su inscripcion con torneo, disciplina y categoria correspondiente."}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsExternalFormOpen(false);
                  setFormError(null);
                }}
              >
                Volver a jugadores
              </Button>
            </div>
          </div>
          {formError && (
            <Alert
              type="warning"
              message={formError}
              onClose={() => setFormError(null)}
              closable
            />
          )}
          <ExternalAthleteForm
            formData={athleteForm}
            setFormData={setAthleteForm}
            disciplinas={disciplinasInscripcion}
            categorias={categoriasInscripcion}
            tutorApplies={tutorApplies}
            experiences={experiences}
            setExperiences={setExperiences}
            isSubmitting={isSubmittingAthlete}
            onSubmit={handleExternalAthleteSubmit}
            submitLabel={isDelegado ? "Registrar deportista UCB" : "Inscribir jugador"}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
          <div className="h-1.5 bg-[var(--color-yellow)]" />
          <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
              Participantes
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Gestion de Jugadores
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              Administra los datos de contacto y la asignacion de equipos de cada
              jugador registrado.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isDelegado && (
              <Button variant="secondary" onClick={openAssign} className="gap-2">
                <BadgeCheck size={20} />
                Inscribir jugador a equipo
              </Button>
            )}
            <Button variant="primary" onClick={openCreate} className="gap-2">
              <Plus size={20} />
              {isDelegado ? "Nuevo deportista UCB" : "Nuevo Jugador"}
            </Button>
          </div>
          </div>
        </div>

        {pageMessage && (
          <Alert
            type="success"
            message={pageMessage}
            onClose={() => setPageMessage(null)}
            closable
          />
        )}

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
                      {!isDelegado && (
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
                      )}
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
          title={
            isDelegado
              ? delegateModalMode === "assign"
                ? "Inscribir jugador a equipo"
                : "Nuevo deportista UCB"
              : editingId
                ? "Editar Jugador"
                : "Nuevo Jugador"
          }
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
            {isDelegado && delegateModalMode === "assign" ? (
              <>
                <Select
                  label="Jugador"
                  value={selectedJugadorId}
                  onChange={(event) => setSelectedJugadorId(event.target.value)}
                  options={personas.map((persona) => ({
                    value: persona.id,
                    label: `${persona.nombre} ${persona.apellido} - CI ${getPlayerDocument(persona)}`,
                  }))}
                  fullWidth
                  required
                />
                <Select
                  label="Disciplina"
                  value={selectedDisciplinaId}
                  onChange={(event) => {
                    setSelectedDisciplinaId(event.target.value);
                    setFormData({ ...formData, equipo_id: "" });
                  }}
                  options={disciplinaOptions}
                  fullWidth
                  required
                />
                <Select
                  label="Equipo"
                  value={formData.equipo_id}
                  onChange={(event) =>
                    setFormData({ ...formData, equipo_id: event.target.value })
                  }
                  options={equiposFiltrados.map((equipo) => ({
                    value: equipo.id,
                    label: equipo.nombre,
                  }))}
                  fullWidth
                  required
                />
              </>
            ) : (
              <>
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
            {isDelegado && (
              <p className="text-xs font-semibold text-gray-500">
                Debe terminar en @ucb.edu.bo
              </p>
            )}
            <Input
              label="Celular"
              value={formData.celular}
              onChange={(event) =>
                setFormData({ ...formData, celular: event.target.value })
              }
              fullWidth
              required
            />
            {!isDelegado && (
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
            )}
              </>
            )}
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
                {isDelegado && delegateModalMode === "assign"
                  ? "Inscribir jugador"
                  : editingId
                    ? "Actualizar Jugador"
                    : isDelegado
                      ? "Crear deportista UCB"
                      : "Crear Jugador"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

interface ExternalAthleteFormProps {
  formData: typeof emptyAthleteForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyAthleteForm>>;
  disciplinas: Array<{ id: number; nombre: string }>;
  categorias: Array<{ id: number; nombre: string }>;
  tutorApplies: boolean;
  experiences: Array<typeof emptyExperience>;
  setExperiences: React.Dispatch<React.SetStateAction<Array<typeof emptyExperience>>>;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
  submitLabel?: string;
}

const ExternalAthleteForm: React.FC<ExternalAthleteFormProps> = ({
  formData,
  setFormData,
  disciplinas,
  categorias,
  tutorApplies,
  experiences,
  setExperiences,
  isSubmitting,
  onSubmit,
  submitLabel = "Inscribir jugador",
}) => (
  <Card className="w-full p-0">
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-5 p-6 pb-0">
        <h2 className="border-b border-primary-200 pb-3 text-sm font-bold uppercase tracking-wide text-primary-800">
          Datos del deportista
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Nombres" value={formData.nombres} onChange={(event) => setFormData({ ...formData, nombres: event.target.value })} required />
          <Input label="Apellido paterno" value={formData.ape_paterno} onChange={(event) => setFormData({ ...formData, ape_paterno: event.target.value })} required />
          <Input label="Apellido materno" value={formData.ape_materno} onChange={(event) => setFormData({ ...formData, ape_materno: event.target.value })} />
          <Input label="Fecha de nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(event) => setFormData({ ...formData, fecha_nacimiento: event.target.value })} required />
          <Input label="CI" value={formData.ci} onChange={(event) => setFormData({ ...formData, ci: event.target.value })} required />
          <Input label="Complemento CI" placeholder="Ej: 1A" value={formData.complemento} onChange={(event) => setFormData({ ...formData, complemento: event.target.value })} />
          <Input label="Celular" value={formData.celular} onChange={(event) => setFormData({ ...formData, celular: event.target.value })} required />
          <Input label="Correo electronico" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required />
          <Input label="Colegio / Instituto" value={formData.colegio_instituto} onChange={(event) => setFormData({ ...formData, colegio_instituto: event.target.value })} required />
          <Input label="Curso" placeholder="Ej: 6to de Secundaria" value={formData.curso} onChange={(event) => setFormData({ ...formData, curso: event.target.value })} required />
          <Select label="Talla de ropa" value={formData.talla_ropa} onChange={(event) => setFormData({ ...formData, talla_ropa: event.target.value })} options={["XS", "S", "M", "L", "XL", "XXL"].map((size) => ({ value: size, label: size }))} />
        </div>
      </section>

      <section className="space-y-5 px-6">
        <h2 className="border-b border-primary-200 pb-3 text-sm font-bold uppercase tracking-wide text-primary-800">
          Inscripcion
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Disciplina" value={formData.id_disciplina} onChange={(event) => setFormData({ ...formData, id_disciplina: event.target.value })} options={disciplinas.map((disciplina) => ({ value: disciplina.id, label: disciplina.nombre }))} required />
          <Select label="Categoria" value={formData.id_categoria} onChange={(event) => setFormData({ ...formData, id_categoria: event.target.value })} options={categorias.map((categoria) => ({ value: categoria.id, label: categoria.nombre }))} required />
        </div>
      </section>

      <section className={`${optionalSectionClass} mx-6`}>
        <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-primary-800">
          <ChevronDown size={14} />
          Tutor / Apoderado
          <span className="text-xs font-medium text-gray-500">opcional</span>
        </h3>
        {!tutorApplies && formData.id_categoria && (
          <p className="mb-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Tutor aplica solo para categoria juvenil o menor.
          </p>
        )}
        {(!formData.id_categoria || tutorApplies) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Nombres" value={formData.tutor_nombres} onChange={(event) => setFormData({ ...formData, tutor_nombres: event.target.value })} />
            <Input label="Apellido paterno" value={formData.tutor_ape_paterno} onChange={(event) => setFormData({ ...formData, tutor_ape_paterno: event.target.value })} />
            <Input label="Apellido materno" value={formData.tutor_ape_materno} onChange={(event) => setFormData({ ...formData, tutor_ape_materno: event.target.value })} />
            <Input label="Fecha de nacimiento" type="date" value={formData.tutor_fecha_nacimiento} onChange={(event) => setFormData({ ...formData, tutor_fecha_nacimiento: event.target.value })} />
            <Input label="CI" value={formData.tutor_ci} onChange={(event) => setFormData({ ...formData, tutor_ci: event.target.value })} />
            <Input label="Complemento CI" value={formData.tutor_complemento} onChange={(event) => setFormData({ ...formData, tutor_complemento: event.target.value })} />
            <Input label="Celular" value={formData.tutor_celular} onChange={(event) => setFormData({ ...formData, tutor_celular: event.target.value })} />
            <Input label="Correo (opcional)" type="email" value={formData.tutor_email} onChange={(event) => setFormData({ ...formData, tutor_email: event.target.value })} />
            <Select label="Rol del tutor" value={formData.tutor_rol} onChange={(event) => setFormData({ ...formData, tutor_rol: event.target.value })} options={["Madre", "Padre", "Tutor", "Apoderado"].map((role) => ({ value: role, label: role }))} />
          </div>
        )}
      </section>

      <section className={`${optionalSectionClass} mx-6`}>
        <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-primary-800">
          <ChevronDown size={14} />
          Ficha medica
          <span className="text-xs font-medium text-gray-500">opcional</span>
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Tipo de sangre" value={formData.tipo_sangre} onChange={(event) => setFormData({ ...formData, tipo_sangre: event.target.value })} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => ({ value: type, label: type }))} />
          <Input label="Seguro medico" value={formData.seguro_medico} onChange={(event) => setFormData({ ...formData, seguro_medico: event.target.value })} />
          <Input label="Enfermedades / padecimientos" value={formData.enfermedades_padecimientos} onChange={(event) => setFormData({ ...formData, enfermedades_padecimientos: event.target.value })} fullWidth />
          <Input label="Contacto de emergencia" value={formData.contacto_emergencia_nombre} onChange={(event) => setFormData({ ...formData, contacto_emergencia_nombre: event.target.value })} />
          <Input label="Telefono de emergencia" value={formData.contacto_emergencia_telefono} onChange={(event) => setFormData({ ...formData, contacto_emergencia_telefono: event.target.value })} />
        </div>
      </section>

      <section className={`${optionalSectionClass} mx-6`}>
        <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-primary-800">
          <ChevronDown size={14} />
          Experiencia deportiva previa
          <span className="text-xs font-medium text-gray-500">opcional</span>
        </h3>
        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <div key={index} className="rounded-lg border border-primary-100 bg-primary-50/20 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Tipo de participacion" placeholder="Ej: Competencia" value={experience.tipo_participacion} onChange={(event) => setExperiences((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, tipo_participacion: event.target.value } : item))} />
                <Input label="Gestion" placeholder="Ej: 2023" value={experience.gestion} onChange={(event) => setExperiences((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, gestion: event.target.value } : item))} />
                <Input label="Club / Sede" value={experience.club_sede} onChange={(event) => setExperiences((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, club_sede: event.target.value } : item))} />
                <Input label="Categoria jugada" value={experience.categoria_jugada} onChange={(event) => setExperiences((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, categoria_jugada: event.target.value } : item))} />
              </div>
              {experiences.length > 1 && (
                <button type="button" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-600" onClick={() => setExperiences((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                  <Trash2 size={14} />
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary-300 px-4 py-3 text-sm font-bold text-primary-700 hover:bg-primary-50" onClick={() => setExperiences((current) => [...current, { ...emptyExperience }])}>
            <Plus size={16} />
            Agregar otra experiencia
          </button>
        </div>
      </section>

      <div className="flex justify-end border-t border-primary-100 bg-gray-50 px-6 py-4">
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  </Card>
);

export default PlayersPage;
