import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, RefreshCw, Shuffle, Trash2 } from "lucide-react";
import { fixtureService } from "../services/fixtureService";
import {
  FixtureMatch,
  FixtureTournament,
  GenerateFixturePayload,
} from "../types";
import "./FixtureManager.css";

const todayKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTeamName = (team: FixtureMatch["equipo_local"], fallback: string) =>
  team?.nombre || team?.nombre_equipo || fallback;

const getTournamentName = (
  tournaments: FixtureTournament[],
  tournamentId: number,
) =>
  tournaments.find((tournament) => tournament.id === tournamentId)?.nombre ||
  `Torneo ${tournamentId}`;

const sortMatches = (matches: FixtureMatch[]) =>
  [...matches].sort((a, b) =>
    `${a.fecha || "9999-12-31"} ${a.hora || ""}`.localeCompare(
      `${b.fecha || "9999-12-31"} ${b.hora || ""}`,
    ),
  );

const defaultGenerateForm = {
  torneo_id: "",
  fecha_inicio: todayKey(),
  hora_inicio: "08:00",
  hora_fin: "18:00",
  duracion_minutos: "60",
  reemplazar_existente: true,
};

const FixtureManager: React.FC = () => {
  const [matches, setMatches] = useState<FixtureMatch[]>([]);
  const [tournaments, setTournaments] = useState<FixtureTournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("all");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFixtureData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fixtureMatches, fixtureTournaments] = await Promise.all([
        fixtureService.getMatches(),
        fixtureService.getTournaments(),
      ]);
      setMatches(sortMatches(fixtureMatches));
      setTournaments(fixtureTournaments);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "No se pudo cargar el fixture.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFixtureData();
  }, []);

  const filteredMatches = useMemo(
    () =>
      selectedTournamentId === "all"
        ? matches
        : matches.filter(
            (match) => String(match.torneo_id) === selectedTournamentId,
          ),
    [matches, selectedTournamentId],
  );

  const calendarMatches = useMemo(
    () => filteredMatches.filter((match) => match.fecha === selectedDate),
    [filteredMatches, selectedDate],
  );

  const handleDelete = async (matchId: number) => {
    if (!window.confirm("¿Eliminar partido?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await fixtureService.deleteMatch(matchId);
      setMatches((current) => current.filter((match) => match.id !== matchId));
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "No se pudo eliminar el partido.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (payload: GenerateFixturePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedMatches = await fixtureService.generateFixture(payload);
      setMatches((current) =>
        sortMatches([
          ...current.filter((match) => match.torneo_id !== payload.torneo_id),
          ...generatedMatches,
        ]),
      );
      setSelectedTournamentId(String(payload.torneo_id));
      setSelectedDate(payload.fecha_inicio);
      setIsGenerateOpen(false);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "No se pudo generar el fixture.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="fixture-feature">
      <div className="fixture-header">
        <div className="fixture-title">
          <h1>Fixture</h1>
          <p>Programa partidos con horarios y canchas compatibles por disciplina.</p>
        </div>
        <div className="fixture-actions">
          <button
            className="fixture-button secondary"
            onClick={loadFixtureData}
            disabled={isLoading}
            type="button"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
          <button
            className="fixture-button primary"
            onClick={() => setIsGenerateOpen(true)}
            disabled={isLoading || tournaments.length === 0}
            type="button"
          >
            <Shuffle size={18} />
            Generar fixture
          </button>
        </div>
      </div>

      {error && <div className="fixture-error">{error}</div>}

      <div className="fixture-card">
        <div className="fixture-filter">
          <div className="fixture-field">
            <label htmlFor="fixture-tournament">Torneo</label>
            <select
              id="fixture-tournament"
              value={selectedTournamentId}
              onChange={(event) => setSelectedTournamentId(event.target.value)}
            >
              <option value="all">Todos los torneos</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="fixture-field">
            <label htmlFor="fixture-date">Fecha</label>
            <input
              id="fixture-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
        </div>

        <FixtureTable
          matches={filteredMatches}
          tournaments={tournaments}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      </div>

      <div className="fixture-card">
        <div className="fixture-title">
          <h1>Calendario deportivo</h1>
          <p>Partidos programados para la fecha seleccionada.</p>
        </div>
        <div className="fixture-calendar">
          {calendarMatches.length === 0 ? (
            <div className="fixture-empty">No hay partidos para esta fecha.</div>
          ) : (
            <FixtureTable
              matches={calendarMatches}
              tournaments={tournaments}
              isLoading={false}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {isGenerateOpen && (
        <GenerateFixtureModal
          tournaments={tournaments}
          onClose={() => setIsGenerateOpen(false)}
          onSubmit={handleGenerate}
          isLoading={isLoading}
        />
      )}
    </section>
  );
};

interface FixtureTableProps {
  matches: FixtureMatch[];
  tournaments: FixtureTournament[];
  isLoading: boolean;
  onDelete: (matchId: number) => Promise<void>;
}

const FixtureTable: React.FC<FixtureTableProps> = ({
  matches,
  tournaments,
  isLoading,
  onDelete,
}) => {
  if (isLoading && matches.length === 0) {
    return <div className="fixture-empty">Cargando fixture...</div>;
  }

  if (matches.length === 0) {
    return <div className="fixture-empty">Todavia no hay partidos registrados.</div>;
  }

  return (
    <div className="fixture-table-wrap">
      <table className="fixture-table">
        <thead>
          <tr>
            <th>Torneo</th>
            <th>Equipos</th>
            <th>Fecha</th>
            <th>Cancha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id}>
              <td>{getTournamentName(tournaments, match.torneo_id)}</td>
              <td>
                <span className="fixture-team">
                  {getTeamName(match.equipo_local, "Equipo local")}
                </span>
                <span className="fixture-muted"> vs </span>
                <span className="fixture-team">
                  {getTeamName(match.equipo_visitante, "Equipo visitante")}
                </span>
              </td>
              <td>
                <div className="fixture-badge">
                  <CalendarDays size={15} />
                  {match.fecha || "Sin fecha"} {match.hora || ""}
                </div>
              </td>
              <td>{match.cancha?.nombre || match.estadio || "Sin cancha"}</td>
              <td>{match.estado || "Programado"}</td>
              <td>
                <button
                  className="fixture-button danger"
                  onClick={() => onDelete(match.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface GenerateFixtureModalProps {
  tournaments: FixtureTournament[];
  onClose: () => void;
  onSubmit: (payload: GenerateFixturePayload) => Promise<void>;
  isLoading: boolean;
}

const GenerateFixtureModal: React.FC<GenerateFixtureModalProps> = ({
  tournaments,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState(defaultGenerateForm);

  useEffect(() => {
    const firstTournament = tournaments[0];
    if (!firstTournament) {
      return;
    }

    setFormData((current) => ({
      ...current,
      torneo_id: current.torneo_id || String(firstTournament.id),
      fecha_inicio:
        String(firstTournament.fecha_inicio || "").split("T")[0] ||
        current.fecha_inicio,
    }));
  }, [tournaments]);

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      torneo_id: Number(formData.torneo_id),
      fecha_inicio: formData.fecha_inicio,
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
      duracion_minutos: Number(formData.duracion_minutos),
      reemplazar_existente: formData.reemplazar_existente,
    });
  };

  return (
    <div className="fixture-modal-backdrop" role="presentation">
      <div className="fixture-modal" role="dialog" aria-modal="true">
        <h2>Generar Fixture</h2>
        <form className="fixture-form" onSubmit={submitForm}>
          <div className="fixture-field">
            <label htmlFor="generate-tournament">Torneo</label>
            <select
              id="generate-tournament"
              required
              value={formData.torneo_id}
              onChange={(event) =>
                setFormData({ ...formData, torneo_id: event.target.value })
              }
            >
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="fixture-field">
            <label htmlFor="generate-date">Fecha inicial</label>
            <input
              id="generate-date"
              required
              type="date"
              value={formData.fecha_inicio}
              onChange={(event) =>
                setFormData({ ...formData, fecha_inicio: event.target.value })
              }
            />
          </div>

          <div className="fixture-grid">
            <div className="fixture-field">
              <label htmlFor="generate-start">Desde</label>
              <input
                id="generate-start"
                required
                type="time"
                value={formData.hora_inicio}
                onChange={(event) =>
                  setFormData({ ...formData, hora_inicio: event.target.value })
                }
              />
            </div>
            <div className="fixture-field">
              <label htmlFor="generate-end">Hasta</label>
              <input
                id="generate-end"
                required
                type="time"
                value={formData.hora_fin}
                onChange={(event) =>
                  setFormData({ ...formData, hora_fin: event.target.value })
                }
              />
            </div>
            <div className="fixture-field">
              <label htmlFor="generate-duration">Minutos</label>
              <input
                id="generate-duration"
                max="240"
                min="15"
                required
                step="15"
                type="number"
                value={formData.duracion_minutos}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    duracion_minutos: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <label className="fixture-check">
            <input
              checked={formData.reemplazar_existente}
              type="checkbox"
              onChange={(event) =>
                setFormData({
                  ...formData,
                  reemplazar_existente: event.target.checked,
                })
              }
            />
            Reemplazar partidos existentes del torneo
          </label>

          <div className="fixture-modal-actions">
            <button
              className="fixture-button secondary"
              disabled={isLoading}
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="fixture-button primary"
              disabled={isLoading}
              type="submit"
            >
              <Plus size={18} />
              Generar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FixtureManager;
