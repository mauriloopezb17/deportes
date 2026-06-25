import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Save } from "lucide-react";
import { Layout } from "@components/layout";
import { Alert, Button, Card, Modal, Table } from "@components/common";
import {
  CoachJugadorEstadistica,
  CoachPartido,
  CoachPartidoDetalle,
  CoachResumen,
  coachService,
} from "../services/coachService";

type StatsState = Record<
  number,
  {
    puntos_goles: number;
    faltas_tarjetas_amarillas: number;
    faltas_tarjetas_rojas: number;
  }
>;

const toInputNumber = (value: number | null | undefined) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const mergeStats = (
  players: CoachJugadorEstadistica[],
  current: StatsState,
): StatsState => {
  const next = { ...current };
  players.forEach((player) => {
    if (!next[player.id_deportista]) {
      next[player.id_deportista] = {
        puntos_goles: player.puntos_goles ?? 0,
        faltas_tarjetas_amarillas: player.faltas_tarjetas_amarillas ?? 0,
        faltas_tarjetas_rojas: player.faltas_tarjetas_rojas ?? 0,
      };
    }
  });
  return next;
};

const CoachPanelView: React.FC = () => {
  const [resumen, setResumen] = useState<CoachResumen | null>(null);
  const [partidos, setPartidos] = useState<CoachPartido[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<CoachPartidoDetalle | null>(
    null,
  );
  const [stats, setStats] = useState<StatsState>({});
  const [resultadoLocal, setResultadoLocal] = useState(0);
  const [resultadoVisitante, setResultadoVisitante] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [resumenData, partidosData] = await Promise.all([
        coachService.obtenerResumen(),
        coachService.obtenerPartidosPendientes(),
      ]);
      setResumen(resumenData);
      setPartidos(partidosData);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo cargar el panel del entrenador.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const allPlayers = useMemo(() => {
    if (!selectedMatch) return [];
    return [
      ...selectedMatch.jugadores_local,
      ...selectedMatch.jugadores_visitante,
    ];
  }, [selectedMatch]);

  const openMatch = async (match: CoachPartido) => {
    setIsDetailLoading(true);
    setError("");
    setSuccess("");
    try {
      const detail = await coachService.obtenerPartido(match.id);
      setSelectedMatch(detail);
      setResultadoLocal(toInputNumber(detail.resultado_local));
      setResultadoVisitante(toInputNumber(detail.resultado_visitante));
      setStats(
        mergeStats(detail.jugadores_visitante, mergeStats(detail.jugadores_local, {})),
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message || "No se pudo abrir el partido seleccionado.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const updateStat = (
    idDeportista: number,
    field: keyof StatsState[number],
    value: number,
  ) => {
    setStats((current) => ({
      ...current,
      [idDeportista]: {
        puntos_goles: current[idDeportista]?.puntos_goles ?? 0,
        faltas_tarjetas_amarillas:
          current[idDeportista]?.faltas_tarjetas_amarillas ?? 0,
        faltas_tarjetas_rojas:
          current[idDeportista]?.faltas_tarjetas_rojas ?? 0,
        [field]: Math.max(0, value),
      },
    }));
  };

  const submitResult = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMatch) return;

    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await coachService.registrarPartido(selectedMatch.id, {
        resultado_local: Math.max(0, resultadoLocal),
        resultado_visitante: Math.max(0, resultadoVisitante),
        estadisticas: allPlayers.map((player) => ({
          id_deportista: player.id_deportista,
          puntos_goles: selectedMatch.permite_anotadores
            ? stats[player.id_deportista]?.puntos_goles ?? 0
            : 0,
          faltas_tarjetas_amarillas:
            stats[player.id_deportista]?.faltas_tarjetas_amarillas ?? 0,
          faltas_tarjetas_rojas:
            stats[player.id_deportista]?.faltas_tarjetas_rojas ?? 0,
        })),
      });
      setSuccess("Partido registrado correctamente.");
      setSelectedMatch(null);
      await loadData();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo registrar el resultado del partido.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderPlayers = (
    title: string,
    players: CoachJugadorEstadistica[],
  ) => (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[620px] bg-white text-sm">
          <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-3 py-2">Jugador</th>
              {selectedMatch?.permite_anotadores && (
                <th className="w-28 px-3 py-2">Goles/Puntos</th>
              )}
              <th className="w-28 px-3 py-2">Amarillas/Faltas</th>
              <th className="w-28 px-3 py-2">Rojas</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id_deportista} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-800">
                  {player.nombre || `Jugador ${player.id_deportista}`}
                </td>
                {selectedMatch?.permite_anotadores && (
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={stats[player.id_deportista]?.puntos_goles ?? 0}
                      onChange={(event) =>
                        updateStat(
                          player.id_deportista,
                          "puntos_goles",
                          Number(event.target.value),
                        )
                      }
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1"
                    />
                  </td>
                )}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={
                      stats[player.id_deportista]?.faltas_tarjetas_amarillas ?? 0
                    }
                    onChange={(event) =>
                      updateStat(
                        player.id_deportista,
                        "faltas_tarjetas_amarillas",
                        Number(event.target.value),
                      )
                    }
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={stats[player.id_deportista]?.faltas_tarjetas_rojas ?? 0}
                    onChange={(event) =>
                      updateStat(
                        player.id_deportista,
                        "faltas_tarjetas_rojas",
                        Number(event.target.value),
                      )
                    }
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1"
                  />
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={4}>
                  No hay jugadores registrados para este equipo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
          <div className="h-1.5 bg-[var(--color-yellow)]" />
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
                Cuerpo tecnico
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Panel de entrenador
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Horarios, categorias y registro de partidos pendientes.
              </p>
            </div>
            <Button onClick={loadData} variant="secondary" isLoading={isLoading}>
              <CalendarDays size={18} />
              Actualizar
            </Button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess("")} />
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-600 text-white">
                <ClipboardList size={22} />
              </span>
              <div>
                <p className="text-sm text-gray-500">Disciplina asignada</p>
                <p className="text-xl font-bold text-gray-950">
                  {resumen?.disciplina?.nombre || "Sin asignar"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-600">
              Categorias visibles
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(resumen?.categorias || []).map((categoria) => (
                <span
                  key={categoria.id}
                  className="rounded-lg border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
                >
                  {categoria.nombre}
                </span>
              ))}
              {resumen?.categorias.length === 0 && (
                <span className="text-sm text-gray-500">
                  Sin categorias asignadas.
                </span>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Partidos pendientes
            </h2>
            <p className="text-sm text-gray-500">
              Selecciona un partido para registrar marcador, faltas y anotadores
              cuando corresponda.
            </p>
          </div>
          <Table
            isLoading={isLoading || isDetailLoading}
            data={partidos}
            onRowClick={openMatch}
            columns={[
              {
                key: "fecha",
                title: "Fecha",
                render: (value) => formatDate(value),
              },
              { key: "hora", title: "Hora" },
              {
                key: "equipos",
                title: "Partido",
                render: (_value, record: CoachPartido) =>
                  `${record.equipo_local?.nombre || "Local"} vs ${
                    record.equipo_visitante?.nombre || "Visitante"
                  }`,
              },
              {
                key: "cancha",
                title: "Cancha",
                render: (_value, record: CoachPartido) =>
                  record.cancha?.nombre || "-",
              },
              { key: "estado", title: "Estado" },
            ]}
          />
        </Card>
      </div>

      <Modal
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        title="Registrar partido"
        size="lg"
      >
        {selectedMatch && (
          <form onSubmit={submitResult} className="space-y-5">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                {formatDate(selectedMatch.fecha)} - {selectedMatch.hora}
              </p>
              <p className="text-lg font-bold text-gray-950">
                {selectedMatch.equipo_local?.nombre || "Local"} vs{" "}
                {selectedMatch.equipo_visitante?.nombre || "Visitante"}
              </p>
              {!selectedMatch.permite_anotadores && (
                <p className="mt-1 text-sm text-gray-600">
                  En volley no se registran jugadores anotadores.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">
                  Resultado local
                </span>
                <input
                  type="number"
                  min={0}
                  value={resultadoLocal}
                  onChange={(event) => setResultadoLocal(Number(event.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">
                  Resultado visitante
                </span>
                <input
                  type="number"
                  min={0}
                  value={resultadoVisitante}
                  onChange={(event) =>
                    setResultadoVisitante(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </label>
            </div>

            {renderPlayers(
              selectedMatch.equipo_local?.nombre || "Equipo local",
              selectedMatch.jugadores_local,
            )}
            {renderPlayers(
              selectedMatch.equipo_visitante?.nombre || "Equipo visitante",
              selectedMatch.jugadores_visitante,
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="danger"
                onClick={() => setSelectedMatch(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save size={18} />
                Guardar registro
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
};

export default CoachPanelView;
