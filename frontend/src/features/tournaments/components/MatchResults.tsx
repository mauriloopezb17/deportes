import React, { useEffect, useMemo, useState } from "react";
import { Partido, UserRole } from "@types";
import { useTournamentStore } from "@/features/tournaments/stores/tournamentStore";
import { Button, Input, Modal, Card, Table, Select } from "@components/common";
import { CalendarDays, Download, Edit2, Plus, Shuffle, Trash2 } from "lucide-react";
import { equipoService } from "@/features/teams/services/equipoService";
import { torneoService } from "@/features/tournaments/services/tournamentService";
import { disciplinaService } from "@/features/disciplines/services/disciplinaService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import logoSrc from "../../../components/images/Logo color - azul (1).png";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatFixtureDate = (value?: string) => {
  if (!value) return "Sin fecha";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatGeneratedAt = () =>
  new Date().toLocaleString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const roundOptions = [
  { value: 1, label: "Fase de grupos" },
  { value: 2, label: "Octavos de final" },
  { value: 3, label: "Cuartos de final" },
  { value: 4, label: "Semifinal" },
  { value: 5, label: "Final" },
  { value: 6, label: "Tercer lugar" },
];

const getRoundLabel = (round?: number | string) => {
  const value = Number(round);
  return (
    roundOptions.find((option) => option.value === value)?.label ??
    `Ronda ${round || "-"}`
  );
};

const getTournamentId = (partido: Partido) =>
  String((partido as any).torneo_id ?? partido.torneo?.id ?? "sin-torneo");

const getTournamentName = (partido: Partido) =>
  partido.torneo?.nombre || "Sin torneo";

const getTeamName = (team: any, fallback: string) =>
  team?.nombre || team?.nombre_equipo || fallback;

const matchHasCarrera = (partido: Partido, carreraId?: number) => {
  if (!carreraId) return true;

  return (
    (partido.equipo_local as any)?.carrera_id === carreraId ||
    (partido.equipo_visitante as any)?.carrera_id === carreraId
  );
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface StandingRow {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

const createStandingRow = (teamId: string, teamName: string): StandingRow => ({
  teamId,
  teamName,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
});

const updateStanding = (
  row: StandingRow,
  goalsFor: number,
  goalsAgainst: number,
) => {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.won += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.drawn += 1;
    row.points += 1;
  } else {
    row.lost += 1;
  }
};

const buildStandings = (partidos: Partido[]) => {
  const table = new Map<string, StandingRow>();

  partidos.forEach((partido) => {
    const localId = String(
      (partido as any).equipo_local_id ?? partido.equipo_local?.id ?? "",
    );
    const visitanteId = String(
      (partido as any).equipo_visitante_id ??
        partido.equipo_visitante?.id ??
        "",
    );

    if (!localId || !visitanteId || !partido.resultado) return;

    if (!table.has(localId)) {
      table.set(
        localId,
        createStandingRow(
          localId,
          getTeamName(partido.equipo_local, "Equipo local"),
        ),
      );
    }

    if (!table.has(visitanteId)) {
      table.set(
        visitanteId,
        createStandingRow(
          visitanteId,
          getTeamName(partido.equipo_visitante, "Equipo visitante"),
        ),
      );
    }

    updateStanding(
      table.get(localId)!,
      partido.resultado.goles_local,
      partido.resultado.goles_visitante,
    );
    updateStanding(
      table.get(visitanteId)!,
      partido.resultado.goles_visitante,
      partido.resultado.goles_local,
    );
  });

  return [...table.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.teamName.localeCompare(b.teamName),
  );
};

const groupByTournament = (partidos: Partido[]) =>
  partidos.reduce<Record<string, Partido[]>>((groups, partido) => {
    const tournamentName = partido.torneo?.nombre || "Sin torneo";
    return {
      ...groups,
      [tournamentName]: [...(groups[tournamentName] || []), partido],
    };
  }, {});

const groupByDate = (partidos: Partido[]) =>
  partidos.reduce<Record<string, Partido[]>>((groups, partido) => {
    const date = partido.fecha || "Sin fecha";
    return {
      ...groups,
      [date]: [...(groups[date] || []), partido],
    };
  }, {});

const getCourtName = (partido: Partido) =>
  partido.cancha?.nombre || (partido as any).estadio || "Cancha por definir";

const buildMatchCards = (partidos: Partido[]) =>
  partidos
    .map(
      (partido) => `
        <article class="match-card">
          <div class="match-time">${escapeHtml(partido.hora || "Sin hora")}</div>
          <div class="match-teams">
            <small>${escapeHtml(getRoundLabel((partido as any).ronda))}</small>
            <strong>${escapeHtml(partido.equipo_local?.nombre || "Equipo local")}</strong>
            <span>vs</span>
            <strong>${escapeHtml(partido.equipo_visitante?.nombre || "Equipo visitante")}</strong>
          </div>
          <div class="match-court">
            <span>Cancha</span>
            <strong>${escapeHtml(getCourtName(partido))}</strong>
          </div>
        </article>
      `,
    )
    .join("");

const buildTournamentSections = (partidos: Partido[]) => {
  const tournaments = groupByTournament(partidos);

  return Object.entries(tournaments)
    .map(([tournamentName, tournamentMatches]) => {
      const dates = groupByDate(tournamentMatches);

      return `
        <section class="tournament">
          <div class="tournament-title">
            <span>Torneo</span>
            <h2>${escapeHtml(tournamentName)}</h2>
          </div>
          ${Object.entries(dates)
            .map(
              ([date, dateMatches]) => `
                <div class="date-block">
                  <h3>${escapeHtml(formatFixtureDate(date))}</h3>
                  <div class="match-list">
                    ${buildMatchCards(dateMatches)}
                  </div>
                </div>
              `,
            )
            .join("")}
        </section>
      `;
    })
    .join("");
};

const createPrintFrame = () => {
  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";
  document.body.appendChild(printFrame);
  return printFrame;
};

const exportFixturePdf = (partidos: Partido[]) => {
  const sortedPartidos = [...partidos].sort((a, b) =>
    `${a.fecha || "9999-12-31"} ${a.hora || ""}`.localeCompare(
      `${b.fecha || "9999-12-31"} ${b.hora || ""}`,
    ),
  );
  const printFrame = createPrintFrame();
  const printDocument = printFrame.contentWindow?.document;

  if (!printDocument) {
    printFrame.remove();
    window.alert("No se pudo preparar el documento para exportar.");
    return;
  }

  printDocument.write(`
    <!doctype html>
    <html>
          <head>
        <meta charset="utf-8" />
        <title>Fixture - Gestion Deportiva</title>
        <style>
          :root {
            --color-white: #FFFFFF;
            --color-yellow: #FEC000;
            --color-cyan: #009DCD;
            --color-navy: #052845;
            --color-gray: #8b8b8b;
          }

          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: var(--color-navy);
            font-family: Arial, Helvetica, sans-serif;
            background: var(--color-white);
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            border-radius: 18px;
            background: var(--color-navy);
            color: var(--color-white);
            padding: 18px 22px;
            margin-bottom: 16px;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .brand img {
            width: 70px;
            height: 70px;
            object-fit: contain;
            border-radius: 12px;
            background: var(--color-white);
            padding: 5px;
          }

          .eyebrow {
            margin: 0 0 4px;
            color: var(--color-cyan);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-size: 26px;
          }

          .meta {
            color: var(--color-gray);
            font-size: 12px;
            text-align: right;
          }

          .intro {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            border: 1px solid rgba(0,157,205,0.12);
            border-radius: 14px;
            background: var(--color-white);
            padding: 12px 16px;
            margin-bottom: 16px;
          }

          .intro p {
            margin: 0;
            color: var(--color-gray);
            font-size: 13px;
          }

          .count {
            border-radius: 999px;
            background: rgba(0,157,205,0.12);
            color: var(--color-navy);
            font-size: 12px;
            font-weight: 700;
            padding: 8px 12px;
            white-space: nowrap;
          }

          .tournament {
            break-inside: avoid;
            border: 1px solid rgba(0,0,0,0.06);
            border-radius: 18px;
            background: var(--color-white);
            overflow: hidden;
            margin-bottom: 18px;
          }

          .tournament-title {
            background: linear-gradient(135deg, var(--color-cyan), var(--color-navy));
            color: var(--color-white);
            padding: 16px 20px;
          }

          .tournament-title span {
            display: block;
            color: rgba(255,255,255,0.85);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .tournament-title h2 {
            margin: 4px 0 0;
            font-size: 24px;
          }

          .date-block {
            padding: 16px 18px 2px;
          }

          .date-block h3 {
            margin: 0 0 10px;
            color: var(--color-gray);
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .match-list {
            display: grid;
            gap: 10px;
            padding-bottom: 14px;
          }

          .match-card {
            display: grid;
            grid-template-columns: 96px 1fr 170px;
            align-items: center;
            gap: 12px;
            border: 1px solid rgba(0,0,0,0.06);
            border-radius: 14px;
            background: var(--color-white);
            padding: 12px;
          }

          .match-time {
            border-radius: 12px;
            background: var(--color-navy);
            color: var(--color-white);
            font-size: 19px;
            font-weight: 800;
            padding: 12px 8px;
            text-align: center;
          }

          .match-teams {
            display: grid;
            grid-template-columns: 1fr 36px 1fr;
            align-items: center;
            gap: 8px;
            font-size: 17px;
            text-align: center;
          }

          .match-teams small {
            grid-column: 1 / -1;
            justify-self: center;
            border-radius: 999px;
            background: rgba(0,157,205,0.12);
            color: var(--color-navy);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.08em;
            padding: 5px 10px;
            text-transform: uppercase;
          }

          .match-teams span {
            color: var(--color-gray);
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .match-court {
            border-left: 1px solid rgba(0,0,0,0.06);
            padding-left: 12px;
          }

          .match-court span {
            display: block;
            color: var(--color-gray);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .match-court strong {
            display: block;
            margin-top: 4px;
            color: var(--color-navy);
            font-size: 13px;
          }

          .empty {
            border: 1px dashed var(--color-gray);
            border-radius: 14px;
            background: var(--color-white);
            color: var(--color-gray);
            padding: 24px;
            text-align: center;
          }

          .footer {
            margin-top: 18px;
            border-top: 1px solid rgba(0,0,0,0.06);
            padding-top: 10px;
            color: var(--color-gray);
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <section class="header">
          <div class="brand">
            <img src="${logoSrc}" alt="Logo universidad" />
            <div>
              <p class="eyebrow">Universidad Catolica Boliviana</p>
              <h1>Fixture deportivo</h1>
            </div>
          </div>
          <div class="meta">
            <strong>Gestion Deportiva</strong><br />
            Emitido: ${escapeHtml(formatGeneratedAt())}
          </div>
        </section>

        <section class="intro">
          <p>Programacion oficial de partidos registrados en el sistema.</p>
          <span class="count">${sortedPartidos.length} partidos</span>
        </section>

        ${
          sortedPartidos.length > 0
            ? buildTournamentSections(sortedPartidos)
            : `<div class="empty">No existen partidos registrados.</div>`
        }

        <p class="footer">
          Documento generado desde el modulo Fixture del sistema GestionD.
        </p>

        <script>
          window.onload = () => {
            window.focus();
            setTimeout(() => window.print(), 250);
          };
        </script>
      </body>
    </html>
  `);
  printDocument.close();

  setTimeout(() => {
    printFrame.remove();
  }, 60000);
};

const MatchResultsList: React.FC = () => {
  const { partidos, isLoading, obtenerPartidos, registrarResultado } =
    useTournamentStore();
  const { usuario, hasRole } = useAuthStore();
  const isDelegado = hasRole(UserRole.DELEGADO) && !hasRole(UserRole.ADMIN);
  const delegadoCarreraId = usuario?.carrera_id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Partido | null>(null);

  useEffect(() => {
    obtenerPartidos();
  }, [obtenerPartidos]);

  const visiblePartidos = partidos.filter((partido) =>
    isDelegado ? matchHasCarrera(partido, delegadoCarreraId) : true,
  );

  const finishedMatches = visiblePartidos.filter(
    (partido) => partido.estado === "finalizado" || partido.resultado,
  );
  const pendingMatches = visiblePartidos.filter(
    (partido) => partido.estado !== "finalizado" && !partido.resultado,
  );

  const columns = [
    {
      key: "ronda",
      title: "Etapa",
      render: (value: number | string) => (
        <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
          {getRoundLabel(value)}
        </span>
      ),
    },
    {
      key: "fecha",
      title: "Fecha",
      render: (_value: string, record: Partido) => (
        <div>
          <p className="font-semibold text-gray-900">{record.fecha || "-"}</p>
          <p className="text-xs text-gray-500">{record.hora || "Sin hora"}</p>
        </div>
      ),
    },
    {
      key: "partido",
      title: "Partido",
      render: (_value: unknown, record: Partido) => (
        <div className="font-medium text-gray-900">
          {record.equipo_local?.nombre || "Equipo local"} vs{" "}
          {record.equipo_visitante?.nombre || "Equipo visitante"}
        </div>
      ),
    },
    {
      key: "resultado",
      title: "Resultado",
      render: (_value: unknown, record: Partido) =>
        record.resultado ? (
          <span className="text-lg font-bold text-gray-900">
            {record.resultado.goles_local} - {record.resultado.goles_visitante}
          </span>
        ) : (
          <span className="text-sm text-gray-500">Pendiente</span>
        ),
    },
    {
      key: "estado",
      title: "Estado",
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            value === "finalizado"
              ? "bg-green-100 text-green-800"
              : value === "en_curso"
                ? "bg-blue-100 text-blue-800"
                : "bg-amber-100 text-amber-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    ...(!isDelegado
      ? [
          {
            key: "acciones",
            title: "Acciones",
            render: (_value: unknown, record: Partido) => (
              <Button
                size="sm"
                variant={record.estado === "finalizado" ? "secondary" : "primary"}
                onClick={() => {
                  setSelectedMatch(record);
                  setIsModalOpen(true);
                }}
              >
                {record.estado === "finalizado" ? "Editar resultado" : "Registrar"}
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
        <div className="h-1.5 bg-[var(--color-yellow)]" />
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
            Centro de resultados
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Resultados</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
            {isDelegado
              ? "Consulta los resultados de partidos de tu carrera."
              : "Registra marcadores y revisa los partidos finalizados."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-lg border border-white/30 bg-white px-4 py-3 text-[var(--color-navy)] shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-gray-700">
              Finalizados
            </p>
            <p className="text-2xl font-bold text-gray-950">
              {finishedMatches.length}
            </p>
          </div>
          <div className="rounded-lg border border-white/30 bg-white px-4 py-3 text-[var(--color-navy)] shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-gray-700">
              Pendientes
            </p>
            <p className="text-2xl font-bold text-gray-950">
              {pendingMatches.length}
            </p>
          </div>
        </div>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={visiblePartidos} isLoading={isLoading} />
      </Card>

      {!isDelegado && (
        <ResultadoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMatch(null);
          }}
          partido={selectedMatch}
          onSubmit={async (datos) => {
            if (selectedMatch) {
              await registrarResultado(selectedMatch.id, datos);
              setIsModalOpen(false);
              obtenerPartidos();
            }
          }}
        />
      )}
    </div>
  );
};

export const FixtureList: React.FC = () => {
  const {
    partidos,
    isLoading,
    obtenerPartidos,
    crearPartido,
    generarFixture,
    actualizarPartido,
    eliminarPartido,
  } = useTournamentStore();
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Partido | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState("all");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    toDateKey(new Date()),
  );

  useEffect(() => {
    obtenerPartidos();
  }, [obtenerPartidos]);

  const tournamentOptions = useMemo(() => {
    const options = new Map<string, string>();

    partidos.forEach((partido) => {
      options.set(getTournamentId(partido), getTournamentName(partido));
    });

    return [...options.entries()].map(([id, name]) => ({ id, name }));
  }, [partidos]);

  const selectedTournamentPartidos = useMemo(
    () =>
      selectedTournamentId === "all"
        ? partidos
        : partidos.filter(
            (partido) => getTournamentId(partido) === selectedTournamentId,
          ),
    [partidos, selectedTournamentId],
  );

  const standings = useMemo(
    () => buildStandings(selectedTournamentPartidos),
    [selectedTournamentPartidos],
  );

  const calendarMatches = useMemo(
    () =>
      selectedTournamentPartidos
        .filter((partido) => partido.fecha === selectedCalendarDate)
        .sort((a, b) => (a.hora || "").localeCompare(b.hora || "")),
    [selectedCalendarDate, selectedTournamentPartidos],
  );

  const reportRows = useMemo(
    () =>
      standings.map((row) => {
        const upcoming = selectedTournamentPartidos
          .filter(
            (partido) =>
              !partido.resultado &&
              [
                String(
                  (partido as any).equipo_local_id ??
                    partido.equipo_local?.id ??
                    "",
                ),
                String(
                  (partido as any).equipo_visitante_id ??
                    partido.equipo_visitante?.id ??
                    "",
                ),
              ].includes(row.teamId),
          )
          .sort((a, b) =>
            `${a.fecha || "9999-12-31"} ${a.hora || ""}`.localeCompare(
              `${b.fecha || "9999-12-31"} ${b.hora || ""}`,
            ),
          )[0];

        return { ...row, upcoming };
      }),
    [selectedTournamentPartidos, standings],
  );

  const columns = [
    {
      key: "equipo_local",
      title: "Equipo Local",
      render: (value: any) => value?.nombre || "-",
    },
    {
      key: "equipo_visitante",
      title: "Equipo Visitante",
      render: (value: any) => value?.nombre || "-",
    },
    {
      key: "fecha",
      title: "Fecha",
      render: (_value: string, record: Partido) => (
        <div className="flex items-center gap-2 text-gray-700">
          <CalendarDays size={16} className="text-primary-600" />
          <span>{record.fecha || "Sin fecha"}</span>
          {record.hora && <span className="text-gray-500">{record.hora}</span>}
        </div>
      ),
    },
    {
      key: "cancha",
      title: "Disciplina",
      render: (_value: unknown, record: Partido) =>
        record.cancha?.nombre || "Sin disciplina",
    },
    {
      key: "estado",
      title: "Estado",
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            value === "finalizado"
              ? "bg-green-100 text-green-800"
              : value === "en_curso"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      render: (_value: unknown, record: Partido) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingFixture(record);
              setIsFixtureModalOpen(true);
            }}
          >
            <Edit2 size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (window.confirm("¿Eliminar partido?")) {
                eliminarPartido(record.id);
              }
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
        <div className="h-1.5 bg-[var(--color-yellow)]" />
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
            Calendario competitivo
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Fixture</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
            Programa partidos, fechas, horarios y disciplinas del torneo.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={isLoading}
          >
            <Shuffle size={20} />
            Generar fixture
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => exportFixturePdf(partidos)}
            disabled={isLoading || partidos.length === 0}
          >
            <Download size={20} />
            Exportar PDF
          </Button>
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => {
              setEditingFixture(null);
              setIsFixtureModalOpen(true);
            }}
          >
            <Plus size={20} />
            Nuevo Partido
          </Button>
        </div>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={partidos} isLoading={isLoading} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Tabla de posiciones dinamica
              </h2>
              <p className="text-sm text-gray-500">
                Calculada automaticamente desde los resultados registrados.
              </p>
            </div>
            <Select
              label="Torneo"
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              options={[
                { value: "all", label: "Todos los torneos" },
                ...tournamentOptions.map((torneo) => ({
                  value: torneo.id,
                  label: torneo.name,
                })),
              ]}
            />
          </div>

          {standings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500">
              Registra resultados para generar la tabla de posiciones.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full bg-white text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Equipo</th>
                    <th className="px-4 py-3">PJ</th>
                    <th className="px-4 py-3">PG</th>
                    <th className="px-4 py-3">PE</th>
                    <th className="px-4 py-3">PP</th>
                    <th className="px-4 py-3">GF</th>
                    <th className="px-4 py-3">GC</th>
                    <th className="px-4 py-3">DG</th>
                    <th className="px-4 py-3">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, index) => (
                    <tr
                      key={row.teamId}
                      className="border-t border-gray-100 text-center"
                    >
                      <td className="px-4 py-3 text-left font-bold text-primary-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-left font-semibold text-gray-900">
                        {row.teamName}
                      </td>
                      <td className="px-4 py-3">{row.played}</td>
                      <td className="px-4 py-3">{row.won}</td>
                      <td className="px-4 py-3">{row.drawn}</td>
                      <td className="px-4 py-3">{row.lost}</td>
                      <td className="px-4 py-3">{row.goalsFor}</td>
                      <td className="px-4 py-3">{row.goalsAgainst}</td>
                      <td className="px-4 py-3">{row.goalDifference}</td>
                      <td className="px-4 py-3 text-lg font-bold text-gray-950">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wide text-primary-700">
              HU-WEB-06
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Calendario deportivo
            </h2>
            <p className="text-sm text-gray-500">
              Consulta partidos programados por fecha.
            </p>
          </div>
          <Input
            label="Fecha"
            type="date"
            value={selectedCalendarDate}
            onChange={(e) => setSelectedCalendarDate(e.target.value)}
            fullWidth
          />
          <div className="mt-5 space-y-3">
            {calendarMatches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No hay partidos para esta fecha.
              </div>
            ) : (
              calendarMatches.map((partido) => (
                <div
                  key={partido.id}
                  className="rounded-lg border border-sky-100 bg-sky-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-bold text-white">
                      {partido.hora || "Sin hora"}
                    </span>
                    <span className="text-xs font-bold uppercase text-sky-800">
                      {partido.cancha?.nombre || "Sin cancha"}
                    </span>
                  </div>
                  <p className="mt-3 text-center font-bold text-gray-900">
                    {getTeamName(partido.equipo_local, "Equipo local")} vs{" "}
                    {getTeamName(partido.equipo_visitante, "Equipo visitante")}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            Reporte resumido de equipos por torneo
          </h2>
          <p className="text-sm text-gray-500">
            Resume rendimiento y proximo partido de cada equipo.
          </p>
        </div>

        {reportRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500">
            Selecciona un torneo con resultados para ver el reporte.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportRows.map((row) => (
              <div
                key={row.teamId}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-950">{row.teamName}</h3>
                    <p className="text-sm text-gray-500">
                      {row.played} partidos jugados
                    </p>
                  </div>
                  <span className="rounded-lg bg-primary-600 px-3 py-2 text-lg font-bold text-white">
                    {row.points}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded bg-white p-2">
                    <p className="font-bold text-emerald-700">{row.won}</p>
                    <p className="text-xs text-gray-500">Ganados</p>
                  </div>
                  <div className="rounded bg-white p-2">
                    <p className="font-bold text-amber-700">{row.drawn}</p>
                    <p className="text-xs text-gray-500">Empates</p>
                  </div>
                  <div className="rounded bg-white p-2">
                    <p className="font-bold text-red-700">{row.lost}</p>
                    <p className="text-xs text-gray-500">Perdidos</p>
                  </div>
                </div>
                <div className="mt-4 rounded bg-white p-3 text-sm">
                  <p className="font-semibold text-gray-700">Proximo partido</p>
                  <p className="mt-1 text-gray-600">
                    {row.upcoming
                      ? `${formatFixtureDate(row.upcoming.fecha)} - ${
                          row.upcoming.hora || "Sin hora"
                        }`
                      : "Sin partido pendiente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <FixtureModal
        isOpen={isFixtureModalOpen}
        onClose={() => {
          setIsFixtureModalOpen(false);
          setEditingFixture(null);
        }}
        partido={editingFixture}
        onSubmit={async (data) => {
          if (editingFixture) {
            await actualizarPartido(editingFixture.id, data);
          } else {
            await crearPartido(data);
          }
          setIsFixtureModalOpen(false);
          setEditingFixture(null);
        }}
      />

      <GenerateFixtureModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSubmit={async (data) => {
          await generarFixture(data);
          await obtenerPartidos();
          setIsGenerateModalOpen(false);
        }}
      />
    </div>
  );
};

interface GenerateFixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const GenerateFixtureModal: React.FC<GenerateFixtureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    torneo_id: "",
    fecha_inicio: toDateKey(new Date()),
    hora_inicio: "08:00",
    hora_fin: "18:00",
    duracion_minutos: "60",
    reemplazar_existente: true,
  });

  useEffect(() => {
    const loadTorneos = async () => {
      const response = await torneoService.obtenerTorneos();
      setTorneos(response.data);

      const firstTournament = response.data[0];
      if (firstTournament) {
        setFormData((current) => ({
          ...current,
          torneo_id: current.torneo_id || String(firstTournament.id),
          fecha_inicio:
            current.fecha_inicio ||
            String(firstTournament.fecha_inicio || "").split("T")[0] ||
            toDateKey(new Date()),
        }));
      }
    };

    if (isOpen) {
      loadTorneos();
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        torneo_id: Number(formData.torneo_id),
        fecha_inicio: formData.fecha_inicio,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        duracion_minutos: Number(formData.duracion_minutos),
        reemplazar_existente: formData.reemplazar_existente,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Fixture">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Torneo"
          value={formData.torneo_id}
          onChange={(event) =>
            setFormData({ ...formData, torneo_id: event.target.value })
          }
          options={torneos.map((torneo) => ({
            value: torneo.id,
            label: torneo.nombre,
          }))}
          fullWidth
          required
        />

        <Input
          label="Fecha inicial"
          type="date"
          value={formData.fecha_inicio}
          onChange={(event) =>
            setFormData({ ...formData, fecha_inicio: event.target.value })
          }
          fullWidth
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Desde"
            type="time"
            value={formData.hora_inicio}
            onChange={(event) =>
              setFormData({ ...formData, hora_inicio: event.target.value })
            }
            required
          />
          <Input
            label="Hasta"
            type="time"
            value={formData.hora_fin}
            onChange={(event) =>
              setFormData({ ...formData, hora_fin: event.target.value })
            }
            required
          />
          <Input
            label="Minutos"
            type="number"
            min="15"
            max="240"
            step="15"
            value={formData.duracion_minutos}
            onChange={(event) =>
              setFormData({ ...formData, duracion_minutos: event.target.value })
            }
            required
          />
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary-600"
            checked={formData.reemplazar_existente}
            onChange={(event) =>
              setFormData({
                ...formData,
                reemplazar_existente: event.target.checked,
              })
            }
          />
          Reemplazar partidos existentes del torneo
        </label>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Generar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface FixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  partido: Partido | null;
  onSubmit: (data: any) => Promise<void>;
}

const FixtureModal: React.FC<FixtureModalProps> = ({
  isOpen,
  onClose,
  partido,
  onSubmit,
}) => {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    torneo_id: "",
    ronda: "1",
    equipo_local_id: "",
    equipo_visitante_id: "",
    fecha: "",
    hora: "",
    estadio: "",
  });

  useEffect(() => {
    const loadOptions = async () => {
      const [torneosResponse, equiposResponse, disciplinasResponse] =
        await Promise.all([
          torneoService.obtenerTorneos(),
          equipoService.obtenerEquipos(),
          disciplinaService.obtenerDisciplinas(),
        ]);
      setTorneos(torneosResponse.data);
      setEquipos(equiposResponse.data);
      setDisciplinas(disciplinasResponse.data);
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (partido) {
      setFormData({
        torneo_id: String(
          (partido as any).torneo_id ?? partido.torneo?.id ?? "",
        ),
        ronda: String((partido as any).ronda ?? "1"),
        equipo_local_id: String(
          (partido as any).equipo_local_id ?? partido.equipo_local?.id ?? "",
        ),
        equipo_visitante_id: String(
          (partido as any).equipo_visitante_id ??
            partido.equipo_visitante?.id ??
            "",
        ),
        fecha: partido.fecha ?? "",
        hora: partido.hora ?? "",
        estadio: partido.cancha?.nombre ?? (partido as any).estadio ?? "",
      });
    } else {
      setFormData({
        torneo_id: "",
        ronda: "1",
        equipo_local_id: "",
        equipo_visitante_id: "",
        fecha: "",
        hora: "",
        estadio: "",
      });
    }
  }, [partido, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      torneo_id: Number(formData.torneo_id),
      ronda: Number(formData.ronda),
      equipo_local_id: formData.equipo_local_id
        ? Number(formData.equipo_local_id)
        : undefined,
      equipo_visitante_id: formData.equipo_visitante_id
        ? Number(formData.equipo_visitante_id)
        : undefined,
      fecha: formData.fecha,
      hora: formData.hora,
      estadio: formData.estadio,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={partido ? "Editar Partido" : "Nuevo Partido"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Torneo"
          value={formData.torneo_id}
          onChange={(e) =>
            setFormData({ ...formData, torneo_id: e.target.value })
          }
          options={torneos.map((torneo) => ({
            value: torneo.id,
            label: torneo.nombre,
          }))}
          fullWidth
          required
        />
        <Select
          label="Etapa del torneo"
          value={formData.ronda}
          onChange={(e) => setFormData({ ...formData, ronda: e.target.value })}
          options={roundOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          fullWidth
          required
        />
        <Select
          label="Equipo Local"
          value={formData.equipo_local_id}
          onChange={(e) =>
            setFormData({ ...formData, equipo_local_id: e.target.value })
          }
          options={equipos.map((equipo) => ({
            value: equipo.id,
            label: equipo.nombre,
          }))}
          fullWidth
        />
        <Select
          label="Equipo Visitante"
          value={formData.equipo_visitante_id}
          onChange={(e) =>
            setFormData({ ...formData, equipo_visitante_id: e.target.value })
          }
          options={equipos.map((equipo) => ({
            value: equipo.id,
            label: equipo.nombre,
          }))}
          fullWidth
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
          />
          <Input
            label="Hora"
            type="time"
            value={formData.hora}
            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
          />
        </div>
        <Select
          label="Disciplina"
          value={formData.estadio}
          onChange={(e) =>
            setFormData({ ...formData, estadio: e.target.value })
          }
          options={disciplinas.map((disciplina) => ({
            value: disciplina.nombre,
            label: disciplina.nombre,
          }))}
          fullWidth
        />
        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {partido ? "Actualizar" : "Crear"} Partido
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface ResultadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partido: Partido | null;
  onSubmit: (datos: any) => Promise<void>;
}

const ResultadoModal: React.FC<ResultadoModalProps> = ({
  isOpen,
  onClose,
  partido,
  onSubmit,
}) => {
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [tarjetasAmarillasLocal, setTarjetasAmarillasLocal] = useState(0);
  const [tarjetasAmarillasVisitante, setTarjetasAmarillasVisitante] =
    useState(0);
  const [tarjetasRojasLocal, setTarjetasRojasLocal] = useState(0);
  const [tarjetasRojasVisitante, setTarjetasRojasVisitante] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        tarjetas_amarillas_local: tarjetasAmarillasLocal,
        tarjetas_amarillas_visitante: tarjetasAmarillasVisitante,
        tarjetas_rojas_local: tarjetasRojasLocal,
        tarjetas_rojas_visitante: tarjetasRojasVisitante,
        observaciones,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Resultado">
      {partido && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-lg font-bold">
              {partido.equipo_local?.nombre} vs{" "}
              {partido.equipo_visitante?.nombre}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Goles - ${partido.equipo_local?.nombre}`}
              type="number"
              value={golesLocal}
              onChange={(e) => setGolesLocal(parseInt(e.target.value))}
              min={0}
            />
            <Input
              label={`Goles - ${partido.equipo_visitante?.nombre}`}
              type="number"
              value={golesVisitante}
              onChange={(e) => setGolesVisitante(parseInt(e.target.value))}
              min={0}
            />

            <Input
              label={`Tarjetas Amarillas - ${partido.equipo_local?.nombre}`}
              type="number"
              value={tarjetasAmarillasLocal}
              onChange={(e) =>
                setTarjetasAmarillasLocal(parseInt(e.target.value))
              }
              min={0}
            />
            <Input
              label={`Tarjetas Amarillas - ${partido.equipo_visitante?.nombre}`}
              type="number"
              value={tarjetasAmarillasVisitante}
              onChange={(e) =>
                setTarjetasAmarillasVisitante(parseInt(e.target.value))
              }
              min={0}
            />

            <Input
              label={`Tarjetas Rojas - ${partido.equipo_local?.nombre}`}
              type="number"
              value={tarjetasRojasLocal}
              onChange={(e) => setTarjetasRojasLocal(parseInt(e.target.value))}
              min={0}
            />
            <Input
              label={`Tarjetas Rojas - ${partido.equipo_visitante?.nombre}`}
              type="number"
              value={tarjetasRojasVisitante}
              onChange={(e) =>
                setTarjetasRojasVisitante(parseInt(e.target.value))
              }
              min={0}
            />
          </div>

          <Input
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            fullWidth
            as="textarea"
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Guardar Resultado
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default MatchResultsList;
