import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "@components/layout";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Button, Card, Input, Modal, Select, Table } from "@components/common";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Trophy,
  Users,
} from "lucide-react";
import { Cancha, Equipo, Partido, Reserva, Torneo, UserRole } from "@types";
import { equipoService } from "@/features/teams/services/equipoService";
import { jugadorService } from "@/features/players/services/playerService";
import { partidoService, torneoService } from "@/features/tournaments/services/tournamentService";
import { canchaService, reservaService } from "@/features/reservations/services/fieldService";

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (date?: string) => {
  if (!date) return "Sin fecha";
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Dashboard: React.FC = () => {
  const { usuario } = useAuthStore();
  const [equiposJugador, setEquiposJugador] = useState<Equipo[]>([]);
  const [partidosJugador, setPartidosJugador] = useState<Partido[]>([]);
  const [reservasJugador, setReservasJugador] = useState<Reserva[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({
    cancha_id: "",
    fecha: toDateKey(new Date()),
    hora_inicio: "",
    hora_fin: "",
  });

  const isOnlyPlayer =
    Boolean(usuario?.roles.includes(UserRole.JUGADOR)) &&
    !usuario?.roles.some((role) =>
      [UserRole.ADMIN, UserRole.DELEGADO, UserRole.ENTRENADOR].includes(role),
    );

  useEffect(() => {
    const loadPlayerData = async () => {
      if (!usuario || !isOnlyPlayer) return;

      setIsPlayerLoading(true);
      try {
        const equiposAsignados = await jugadorService.obtenerEquiposPorJugador(
          usuario.id,
        );
        const [partidosResponse, reservasResponse, canchasResponse] = await Promise.allSettled([
          partidoService.obtenerPartidos(),
          reservaService.obtenerReservas(),
          canchaService.obtenerCanchas(),
        ]);
        const equipoIds = new Set(equiposAsignados.map((equipo) => equipo.id));

        setEquiposJugador(equiposAsignados);
        setPartidosJugador(
          (partidosResponse.status === "fulfilled"
            ? partidosResponse.value.data
            : []
          ).filter((partido) => {
            const localId =
              (partido as any).equipo_local_id ?? partido.equipo_local?.id;
            const visitanteId =
              (partido as any).equipo_visitante_id ??
              partido.equipo_visitante?.id;
            return equipoIds.has(localId) || equipoIds.has(visitanteId);
          }),
        );
        setReservasJugador(
          (reservasResponse.status === "fulfilled"
            ? reservasResponse.value.data
            : []
          ).filter((reserva) => {
            const equipoId = (reserva as any).equipo_id ?? reserva.equipo?.id;
            return equipoIds.has(equipoId);
          }),
        );
        setCanchas(
          canchasResponse.status === "fulfilled"
            ? canchasResponse.value.data
            : [],
        );
      } finally {
        setIsPlayerLoading(false);
      }
    };

    loadPlayerData();
  }, [usuario, isOnlyPlayer]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!usuario || isOnlyPlayer) return;

      setIsDashboardLoading(true);
      try {
        const [
          equiposResponse,
          torneosResponse,
          partidosResponse,
          reservasResponse,
          canchasResponse,
        ] = await Promise.allSettled([
          equipoService.obtenerEquipos(),
          torneoService.obtenerTorneos(),
          partidoService.obtenerPartidos(),
          reservaService.obtenerReservas(),
          canchaService.obtenerCanchas(),
        ]);

        setEquipos(
          equiposResponse.status === "fulfilled" ? equiposResponse.value.data : [],
        );
        setTorneos(
          torneosResponse.status === "fulfilled" ? torneosResponse.value.data : [],
        );
        setPartidos(
          partidosResponse.status === "fulfilled" ? partidosResponse.value.data : [],
        );
        setReservas(
          reservasResponse.status === "fulfilled" ? reservasResponse.value.data : [],
        );
        setCanchas(
          canchasResponse.status === "fulfilled" ? canchasResponse.value.data : [],
        );
      } finally {
        setIsDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, [usuario, isOnlyPlayer]);

  const selectedDateKey = toDateKey(selectedDate);
  const todayKey = toDateKey(new Date());
  const currentMonth = todayKey.slice(0, 7);

  const monthStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1,
  );
  const monthEnd = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0,
  );
  const calendarOffset = (monthStart.getDay() + 6) % 7;
  const calendarCells = Array.from(
    { length: calendarOffset + monthEnd.getDate() },
    (_, index) => {
      if (index < calendarOffset) return null;
      return new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        index - calendarOffset + 1,
      );
    },
  );

  const adminMetrics = useMemo(() => {
    const reservasEsteMes = reservas.filter((reserva) =>
      reserva.fecha?.startsWith(currentMonth),
    );
    const partidosFinalizados = partidos.filter(
      (partido) => partido.estado === "finalizado" || partido.resultado,
    );
    const torneosActivos = torneos.filter((torneo) =>
      ["planeado", "en_curso"].includes(torneo.estado),
    );
    const canchasDisponibles = canchas.filter(
      (cancha) => cancha.estado === "disponible",
    );

    return {
      reservasEsteMes,
      partidosFinalizados,
      torneosActivos,
      canchasDisponibles,
    };
  }, [canchas, currentMonth, partidos, reservas, torneos]);

  const proximosPartidos = useMemo(
    () =>
      [...partidos]
        .filter((partido) => !partido.fecha || partido.fecha >= todayKey)
        .sort((a, b) =>
          `${a.fecha || "9999-12-31"} ${a.hora || ""}`.localeCompare(
            `${b.fecha || "9999-12-31"} ${b.hora || ""}`,
          ),
        )
        .slice(0, 6),
    [partidos, todayKey],
  );

  const proximasReservas = useMemo(
    () =>
      [...reservas]
        .filter(
          (reserva) => reserva.estado !== "cancelada" && reserva.fecha >= todayKey,
        )
        .sort((a, b) =>
          `${a.fecha} ${a.hora_inicio}`.localeCompare(
            `${b.fecha} ${b.hora_inicio}`,
          ),
        )
        .slice(0, 6),
    [reservas, todayKey],
  );

  const solicitudesPendientes = useMemo(
    () =>
      reservas
        .filter((reserva) => reserva.estado === "pendiente")
        .sort((a, b) =>
          `${a.fecha} ${a.hora_inicio}`.localeCompare(
            `${b.fecha} ${b.hora_inicio}`,
          ),
        ),
    [reservas],
  );

  const selectedDayMatches = partidosJugador.filter(
    (partido) => partido.fecha === selectedDateKey,
  );
  const selectedDayReservations = reservasJugador.filter(
    (reserva) => reserva.fecha === selectedDateKey,
  );
  const nextPlayerMatches = [...partidosJugador]
    .filter((partido) => !partido.fecha || partido.fecha >= todayKey)
    .sort((a, b) =>
      `${a.fecha || "9999-12-31"} ${a.hora || ""}`.localeCompare(
        `${b.fecha || "9999-12-31"} ${b.hora || ""}`,
      ),
    )
    .slice(0, 5);
  const nextPlayerReservations = [...reservasJugador]
    .filter((reserva) => reserva.estado !== "cancelada" && reserva.fecha >= todayKey)
    .sort((a, b) =>
      `${a.fecha} ${a.hora_inicio}`.localeCompare(
        `${b.fecha} ${b.hora_inicio}`,
      ),
    )
    .slice(0, 5);

  const getEventsForDate = (date: Date) => {
    const key = toDateKey(date);
    return {
      matches: partidosJugador.filter((partido) => partido.fecha === key),
      reservations: reservasJugador.filter((reserva) => reserva.fecha === key),
    };
  };

  const playerTeam = equiposJugador[0];

  const handleReservationRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setRequestMessage(null);
    setRequestError(null);

    if (!playerTeam) {
      setRequestError("Necesitas estar asignado a un equipo para solicitar reserva.");
      return;
    }

    if (!requestForm.cancha_id || !requestForm.fecha || !requestForm.hora_inicio || !requestForm.hora_fin) {
      setRequestError("Completa cancha, fecha y horario de la solicitud.");
      return;
    }

    setIsRequestSubmitting(true);
    try {
      const created = await reservaService.crearReserva({
        cancha_id: Number(requestForm.cancha_id),
        equipo_id: playerTeam.id,
        fecha: requestForm.fecha,
        hora_inicio: requestForm.hora_inicio,
        hora_fin: requestForm.hora_fin,
        estado: "pendiente",
        observaciones: `Solicitud enviada por ${usuario?.nombre ?? "jugador"}`,
      });

      setReservasJugador((current) => [...current, created]);
      setSelectedDate(new Date(`${requestForm.fecha}T00:00:00`));
      setRequestMessage("Solicitud enviada. Un administrador o delegado puede revisarla.");
      setRequestForm({
        cancha_id: "",
        fecha: requestForm.fecha,
        hora_inicio: "",
        hora_fin: "",
      });
    } catch (error: any) {
      setRequestError(
        error.response?.data?.message || "No se pudo enviar la solicitud de reserva.",
      );
    } finally {
      setIsRequestSubmitting(false);
    }
  };

  if (isOnlyPlayer) {
    return (
      <Layout>
        <div className="space-y-8">
          <Hero
            eyebrow="Mi calendario deportivo"
            title={`Bienvenido, ${usuario?.nombre ?? "jugador"}`}
            description="Consulta tus partidos, reservas y equipo asignado con datos actualizados."
            aside={
              <div className="space-y-3">
                <MiniMetric label="Equipo" value={equiposJugador[0]?.nombre ?? "Sin equipo"} />
                <Button
                  fullWidth
                  onClick={() => {
                    setRequestMessage(null);
                    setRequestError(null);
                    setIsRequestModalOpen(true);
                  }}
                  disabled={!playerTeam}
                >
                  <Send size={18} />
                  Solicitar reserva
                </Button>
                <MiniMetric label="Partidos próximos" value={nextPlayerMatches.length} />
                <MiniMetric label="Reservas próximas" value={nextPlayerReservations.length} />
              </div>
            }
          />

          {(requestMessage || requestError) && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                requestError
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {requestError || requestMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard label="Mi equipo" value={equiposJugador[0]?.nombre ?? "Sin equipo"} icon={Users} color="bg-sky-50 text-sky-700 border-sky-100" />
            <StatCard label="Partidos" value={partidosJugador.length} icon={Trophy} color="bg-amber-50 text-amber-700 border-amber-100" />
            <StatCard label="Reservas" value={reservasJugador.length} icon={MapPin} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Calendario</h2>
                  <p className="text-sm text-gray-500">
                    Partidos y reservas de tu equipo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                  >
                    Anterior
                  </button>
                  <span className="min-w-36 text-center font-semibold capitalize text-gray-800">
                    {selectedDate.toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                  >
                    Siguiente
                  </button>
                </div>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="h-24 rounded-lg bg-gray-50"
                      />
                    );
                  }

                  const events = getEventsForDate(date);
                  const isSelected = toDateKey(date) === selectedDateKey;

                  return (
                    <button
                      type="button"
                      key={toDateKey(date)}
                      onClick={() => setSelectedDate(date)}
                      className={`h-24 rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-900">
                        {date.getDate()}
                      </span>
                      <div className="mt-2 space-y-1">
                        {events.matches.length > 0 && (
                          <span className="block rounded bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                            {events.matches.length} partido
                          </span>
                        )}
                        {events.reservations.length > 0 && (
                          <span className="block rounded bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                            {events.reservations.length} reserva
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Detalle del día
              </h2>
              <div className="space-y-3">
                {selectedDayMatches.length === 0 &&
                  selectedDayReservations.length === 0 && (
                    <p className="py-8 text-center text-sm text-gray-500">
                      No tienes partidos ni reservas para este día.
                    </p>
                  )}
                {selectedDayMatches.map((partido) => (
                  <EventRow
                    key={`match-${partido.id}`}
                    tone="amber"
                    title={`${partido.equipo_local?.nombre ?? "-"} vs ${
                      partido.equipo_visitante?.nombre ?? "-"
                    }`}
                    subtitle={`${partido.hora || "Sin hora"} · ${
                      partido.cancha?.nombre || "Sin cancha"
                    }`}
                  />
                ))}
                {selectedDayReservations.map((reserva) => (
                  <EventRow
                    key={`reservation-${reserva.id}`}
                    tone="emerald"
                    title={reserva.cancha?.nombre ?? "Cancha reservada"}
                    subtitle={`${reserva.hora_inicio} - ${reserva.hora_fin}`}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <UpcomingMatchesTable
              title="Próximos partidos"
              data={nextPlayerMatches}
              isLoading={isPlayerLoading}
            />
            <UpcomingReservationsTable
              title="Reservas de mi equipo"
              data={nextPlayerReservations}
              isLoading={isPlayerLoading}
            />
          </div>

          <Modal
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            title="Solicitar reserva de cancha"
          >
            <form onSubmit={handleReservationRequest} className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Equipo solicitante:{" "}
                <span className="font-bold text-gray-900">
                  {playerTeam?.nombre ?? "Sin equipo asignado"}
                </span>
              </div>
              <Select
                label="Cancha"
                value={requestForm.cancha_id}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, cancha_id: e.target.value })
                }
                options={canchas.map((cancha) => ({
                  value: cancha.id,
                  label: cancha.nombre,
                }))}
                required
                fullWidth
              />
              <Input
                label="Fecha"
                type="date"
                value={requestForm.fecha}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, fecha: e.target.value })
                }
                required
                fullWidth
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Hora inicio"
                  type="time"
                  value={requestForm.hora_inicio}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      hora_inicio: e.target.value,
                    })
                  }
                  required
                  fullWidth
                />
                <Input
                  label="Hora fin"
                  type="time"
                  value={requestForm.hora_fin}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, hora_fin: e.target.value })
                  }
                  required
                  fullWidth
                />
              </div>
              {requestError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {requestError}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isRequestSubmitting}>
                  <Send size={18} />
                  Enviar solicitud
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <Hero
          eyebrow="Panel principal"
          title={`Bienvenido, ${usuario?.nombre ?? "usuario"}`}
          description="Datos reales de equipos, torneos, fixture, resultados y reservas cargados desde el backend."
          aside={
            <div className="space-y-3">
              <MiniMetric
                label="Canchas disponibles"
                value={`${adminMetrics.canchasDisponibles.length}/${canchas.length}`}
              />
              <MiniMetric label="Solicitudes pendientes" value={solicitudesPendientes.length} />
              <MiniMetric label="Partidos programados" value={proximosPartidos.length} />
              <MiniMetric label="Reservas próximas" value={proximasReservas.length} />
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Equipos registrados"
            value={equipos.length}
            icon={Users}
            color="bg-sky-50 text-sky-700 border-sky-100"
            isLoading={isDashboardLoading}
          />
          <StatCard
            label="Torneos activos"
            value={adminMetrics.torneosActivos.length}
            icon={Trophy}
            color="bg-amber-50 text-amber-700 border-amber-100"
            isLoading={isDashboardLoading}
          />
          <StatCard
            label="Reservas este mes"
            value={adminMetrics.reservasEsteMes.length}
            icon={Calendar}
            color="bg-emerald-50 text-emerald-700 border-emerald-100"
            isLoading={isDashboardLoading}
          />
          <StatCard
            label="Partidos finalizados"
            value={adminMetrics.partidosFinalizados.length}
            icon={BarChart3}
            color="bg-indigo-50 text-indigo-700 border-indigo-100"
            isLoading={isDashboardLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Estado operativo
                </h2>
                <p className="text-sm text-gray-500">
                  Resumen actual de canchas y competencias.
                </p>
              </div>
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
            <div className="space-y-3">
              <ProgressRow
                label="Canchas disponibles"
                value={adminMetrics.canchasDisponibles.length}
                total={Math.max(canchas.length, 1)}
                tone="emerald"
              />
              <ProgressRow
                label="Partidos finalizados"
                value={adminMetrics.partidosFinalizados.length}
                total={Math.max(partidos.length, 1)}
                tone="indigo"
              />
              <ProgressRow
                label="Reservas confirmadas"
                value={reservas.filter((r) => r.estado === "confirmada").length}
                total={Math.max(reservas.length, 1)}
                tone="sky"
              />
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Actividad real del sistema
                </h2>
                <p className="text-sm text-gray-500">
                  Próximos eventos detectados en fixture y reservas.
                </p>
              </div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                {formatDate(todayKey)}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <EventSummary
                icon={Trophy}
                title="Próximo partido"
                value={
                  proximosPartidos[0]
                    ? `${proximosPartidos[0].equipo_local?.nombre ?? "-"} vs ${
                        proximosPartidos[0].equipo_visitante?.nombre ?? "-"
                      }`
                    : "Sin partidos próximos"
                }
                detail={
                  proximosPartidos[0]
                    ? `${formatDate(proximosPartidos[0].fecha)} · ${
                        proximosPartidos[0].hora || "Sin hora"
                      }`
                    : "Crea partidos desde Fixture"
                }
                tone="amber"
              />
              <EventSummary
                icon={MapPin}
                title="Próxima reserva"
                value={
                  proximasReservas[0]?.cancha?.nombre ?? "Sin reservas próximas"
                }
                detail={
                  proximasReservas[0]
                    ? `${formatDate(proximasReservas[0].fecha)} · ${
                        proximasReservas[0].hora_inicio
                      } - ${proximasReservas[0].hora_fin}`
                    : "Agenda reservas desde Canchas"
                }
                tone="emerald"
              />
            </div>
          </Card>
        </div>

        {solicitudesPendientes.length > 0 && (
          <UpcomingReservationsTable
            title="Solicitudes de reserva pendientes"
            data={solicitudesPendientes}
            isLoading={isDashboardLoading}
          />
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <UpcomingMatchesTable
            title="Próximos partidos"
            data={proximosPartidos}
            isLoading={isDashboardLoading}
          />
          <UpcomingReservationsTable
            title="Próximas reservas"
            data={proximasReservas}
            isLoading={isDashboardLoading}
          />
        </div>
      </div>
    </Layout>
  );
};

interface HeroProps {
  eyebrow: string;
  title: string;
  description: string;
  aside: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ eyebrow, title, description, aside }) => (
  <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
    <div className="h-1.5 bg-[var(--color-yellow)]" />
    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:items-center">
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
          {description}
        </p>
      </div>
      <div className="rounded-lg border border-white/20 bg-white/95 p-4 text-gray-950">
        {aside}
      </div>
    </div>
  </div>
);

interface MiniMetricProps {
  label: string;
  value: React.ReactNode;
}

const MiniMetric: React.FC<MiniMetricProps> = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <span className="text-lg font-bold text-gray-950">{value}</span>
  </div>
);

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  isLoading,
}) => (
  <Card hoverable>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {isLoading ? "..." : value}
        </p>
      </div>
      <div className={`rounded-lg border p-3 ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

interface ProgressRowProps {
  label: string;
  value: number;
  total: number;
  tone: "emerald" | "indigo" | "sky";
}

const ProgressRow: React.FC<ProgressRowProps> = ({
  label,
  value,
  total,
  tone,
}) => {
  const percent = Math.min(100, Math.round((value / total) * 100));
  const colors = {
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    sky: "bg-sky-500",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">
          {value}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${colors[tone]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

interface EventSummaryProps {
  icon: React.ElementType;
  title: string;
  value: string;
  detail: string;
  tone: "amber" | "emerald";
}

const EventSummary: React.FC<EventSummaryProps> = ({
  icon: Icon,
  title,
  value,
  detail,
  tone,
}) => {
  const styles = {
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
      <div
        className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${styles[tone]}`}
      >
        <Icon size={20} />
      </div>
      <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <p className="mt-1 font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{detail}</p>
    </div>
  );
};

interface EventRowProps {
  title: string;
  subtitle: string;
  tone: "amber" | "emerald";
}

const EventRow: React.FC<EventRowProps> = ({ title, subtitle, tone }) => {
  const styles = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[tone]}`}>
      <p className="font-bold text-gray-900">{title}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-gray-700">
        <Clock size={16} />
        {subtitle}
      </p>
    </div>
  );
};

interface UpcomingMatchesTableProps {
  title: string;
  data: Partido[];
  isLoading: boolean;
}

const UpcomingMatchesTable: React.FC<UpcomingMatchesTableProps> = ({
  title,
  data,
  isLoading,
}) => (
  <Card>
    <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
    <Table
      columns={[
        {
          key: "equipo_local",
          title: "Local",
          render: (value: Equipo) => value?.nombre ?? "-",
        },
        {
          key: "equipo_visitante",
          title: "Visitante",
          render: (value: Equipo) => value?.nombre ?? "-",
        },
        {
          key: "fecha",
          title: "Fecha",
          render: (value: string) => formatDate(value),
        },
        { key: "hora", title: "Hora" },
        {
          key: "cancha",
          title: "Cancha",
          render: (value: any) => value?.nombre || "Sin cancha",
        },
      ]}
      data={data}
      isLoading={isLoading}
    />
  </Card>
);

interface UpcomingReservationsTableProps {
  title: string;
  data: Reserva[];
  isLoading: boolean;
}

const UpcomingReservationsTable: React.FC<UpcomingReservationsTableProps> = ({
  title,
  data,
  isLoading,
}) => (
  <Card>
    <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
    <Table
      columns={[
        {
          key: "cancha",
          title: "Cancha",
          render: (value: any) => value?.nombre ?? "-",
        },
        {
          key: "equipo",
          title: "Equipo",
          render: (value: any) => value?.nombre ?? "-",
        },
        {
          key: "fecha",
          title: "Fecha",
          render: (value: string) => formatDate(value),
        },
        { key: "hora_inicio", title: "Inicio" },
        { key: "hora_fin", title: "Fin" },
        {
          key: "estado",
          title: "Estado",
          render: (value: string) => (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold capitalize text-gray-700">
              {value}
            </span>
          ),
        },
      ]}
      data={data}
      isLoading={isLoading}
    />
  </Card>
);

export default Dashboard;
