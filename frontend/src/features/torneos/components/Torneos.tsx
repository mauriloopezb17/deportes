import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Tabs from './Tabs'
import {
  getTorneos,
  getDisciplinas,
  getPosiciones,
  getPartidosTorneo,
  getGoleadores,
  getTarjetas,
  getFixture,
  type Torneo,
  type Disciplina,
  type PosicionRow,
  type Partido,
  type Goleador,
  type TarjetaRow,
} from '../services/torneosService'
import './Torneos.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtHora(t: string | null) {
  return t?.slice(0, 5) ?? '—'
}

function short(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 3).toUpperCase()
  return words.map(w => w[0]).join('').slice(0, 3).toUpperCase()
}

// Normalize the API's inconsistent discipline spellings to the canonical sport name.
function sportLabel(name: string) {
  const s = (name ?? '').toLowerCase()
  if (/futsal|f[úu]tsal|f[úu]tbol|futbol/.test(s)) return 'Futsal'
  if (/basket|b[áa]squet|baloncesto/.test(s)) return 'Básquetbol'
  if (/v[oó]le(i|y)|volley/.test(s)) return 'Voleibol'
  return name
}

function LoadingRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>Cargando...</td></tr>
}

function EmptyRow({ cols, msg = 'Sin datos' }: { cols: number; msg?: string }) {
  return <tr><td colSpan={cols} style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>{msg}</td></tr>
}

// Slick fixture row (football-club style: flat, divider-separated, crest + dash/score).
function MatchRow({ p }: { p: Partido }) {
  const finished = p.estado === 'Finalizado' && p.goles_local !== null && p.goles_visitante !== null
  return (
    <div className={`match-row ${finished ? 'played' : 'upcoming'}`}>
      <div className="match-meta">
        <span className="match-when">
          {fmtFecha(p.fecha)}{p.hora_inicio ? ` · ${fmtHora(p.hora_inicio)}` : ''}
        </span>
        <span className="match-comp">{p.fase_torneo ?? p.torneo_nombre}</span>
      </div>
      <div className="match-fixture">
        <div className="team home">
          <span className="team-name">{p.equipo_local}</span>
          <span className="team-crest">{short(p.equipo_local)}</span>
        </div>
        <div className="match-result">
          {finished
            ? <span className="match-score">{p.goles_local}<em>–</em>{p.goles_visitante}</span>
            : <span className="match-dash">–</span>}
        </div>
        <div className="team away">
          <span className="team-crest">{short(p.equipo_visitante)}</span>
          <span className="team-name">{p.equipo_visitante}</span>
        </div>
      </div>
      {p.espacio && <div className="match-venue">Estadio: {p.espacio}</div>}
    </div>
  )
}

// ── Tab: Posiciones ───────────────────────────────────────────────────────────

function StandingsTab({ idTorneo }: { idTorneo: number }) {
  const [rows, setRows]       = useState<PosicionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPosiciones(idTorneo)
      .then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [idTorneo])

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th style={{ width: 50 }} className="num">Pos</th>
            <th>Equipo</th>
            <th className="num">PJ</th>
            <th className="num">PG</th>
            <th className="num">PE</th>
            <th className="num">PP</th>
            <th className="num">GF</th>
            <th className="num">GC</th>
            <th className="num">DG</th>
            <th className="num">Pts</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <LoadingRow cols={10} /> :
           rows.length === 0 ? <EmptyRow cols={10} msg="No hay datos de posiciones aún." /> :
           rows.map((r, idx) => (
            <tr key={r.id_equipo} className={idx === 0 ? 'leader' : ''}>
              <td className="num">{idx + 1}</td>
              <td>
                <div className="team-cell">
                  <div className="team-logo">{short(r.nombre_equipo)}</div>
                  {r.nombre_equipo}
                </div>
              </td>
              <td className="num">{r.pj}</td>
              <td className="num">{r.pg}</td>
              <td className="num">{r.pe}</td>
              <td className="num">{r.pp}</td>
              <td className="num">{r.gf}</td>
              <td className="num">{r.gc}</td>
              <td className="num">{r.dg > 0 ? `+${r.dg}` : r.dg}</td>
              <td className="num pts">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Tab: Partidos & Resultados ────────────────────────────────────────────────

function MatchesTab({ idTorneo }: { idTorneo: number }) {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'todos' | 'Finalizado' | 'Programado'>('todos')

  useEffect(() => {
    setLoading(true)
    getPartidosTorneo(idTorneo)
      .then(setPartidos).catch(() => setPartidos([])).finally(() => setLoading(false))
  }, [idTorneo])

  const visible = filter === 'todos' ? partidos : partidos.filter(p => p.estado === filter)

  const grouped = visible.reduce<Record<string, Partido[]>>((acc, p) => {
    const key = p.fase_torneo ?? 'Partidos'
    ;(acc[key] = acc[key] ?? []).push(p)
    return acc
  }, {})

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['todos', 'Finalizado', 'Programado'] as const).map(f => (
          <button key={f} type="button" onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 20, border: '1.5px solid', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            borderColor: filter === f ? 'var(--ucb-blue)' : 'var(--border-color)',
            background: filter === f ? 'var(--ucb-blue)' : 'white',
            color: filter === f ? 'white' : 'var(--text-light)',
          }}>
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>Cargando...</p>
      ) : visible.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>No hay partidos disponibles.</p>
      ) : (
        Object.entries(grouped).map(([fase, ps]) => (
          <div key={fase} className="jornada-group">
            <h3 className="jornada-title">{fase}</h3>
            {ps.map(p => <MatchRow key={p.id_partido} p={p} />)}
          </div>
        ))
      )}
    </>
  )
}

// ── Tab: Estadísticas ─────────────────────────────────────────────────────────

function StatsTab({ idTorneo }: { idTorneo: number }) {
  const [goleadores, setGoleadores] = useState<Goleador[]>([])
  const [tarjetas, setTarjetas]     = useState<TarjetaRow[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getGoleadores(idTorneo).catch(() => []),
      getTarjetas(idTorneo).catch(() => []),
    ]).then(([g, t]) => { setGoleadores(g); setTarjetas(t) })
      .finally(() => setLoading(false))
  }, [idTorneo])

  return (
    <div className="stats-section-grid">
      <div>
        <div className="stats-card-header">Tabla de Goleadores</div>
        <div className="table-container rounded-bottom">
          <table>
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Jugador</th>
                <th>Equipo</th>
                <th className="num">Goles</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow cols={4} /> :
               goleadores.length === 0 ? <EmptyRow cols={4} msg="Sin goleadores registrados." /> :
               goleadores.map((g, i) => (
                <tr key={g.id_deportista}>
                  <td className="num">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{g.jugador}</td>
                  <td>{g.equipo}</td>
                  <td className="num pts">{g.goles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="stats-card-header alt">Disciplina (Tarjetas)</div>
        <div className="table-container rounded-bottom">
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th className="num">🟨 Amarillas</th>
                <th className="num">🟥 Rojas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow cols={3} /> :
               tarjetas.length === 0 ? <EmptyRow cols={3} msg="Sin tarjetas registradas." /> :
               tarjetas.map(t => (
                <tr key={t.id_equipo}>
                  <td style={{ fontWeight: 600 }}>{t.equipo}</td>
                  <td className="num">{t.amarillas}</td>
                  <td className="num" style={{ color: t.rojas > 0 ? '#ef4444' : undefined, fontWeight: t.rojas > 0 ? 700 : undefined }}>
                    {t.rojas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Calendario ───────────────────────────────────────────────────────────

const CAL_WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const CAL_DISC_COLORS = ['#009dc1', '#fecc00', '#052845', '#16a34a', '#ea580c', '#7c3aed', '#db2777']

function discDot(name?: string | null) {
  const s = name ?? ''
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return CAL_DISC_COLORS[Math.abs(h) % CAL_DISC_COLORS.length]
}

const pad2 = (n: number) => String(n).padStart(2, '0')

// Day key 'YYYY-MM-DD' — taken straight from the raw fecha string (timezone-safe).
const dayKeyFromFecha = (fecha: string) => fecha.slice(0, 10)
const dayKey = (year: number, month0: number, day: number) =>
  `${year}-${pad2(month0 + 1)}-${pad2(day)}`

function fmtDayKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-BO', {
    weekday: 'long', day: '2-digit', month: 'long',
  })
}

function CalendarTab({ idTorneo }: { idTorneo: number }) {
  const [proximos, setProximos] = useState<Partido[]>([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState(() => {
    const t = new Date()
    return { year: t.getFullYear(), month: t.getMonth() }
  })
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setSelectedKey(null)
    getFixture(idTorneo)
      .then(data => {
        setProximos(data)
        if (data.length > 0) {
          const earliest = data.reduce((min, p) => (p.fecha < min ? p.fecha : min), data[0].fecha)
          const [y, m] = earliest.slice(0, 10).split('-').map(Number)
          setView({ year: y, month: m - 1 })
        }
      })
      .catch(() => setProximos([]))
      .finally(() => setLoading(false))
  }, [idTorneo])

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>Cargando...</p>
  if (proximos.length === 0) return <p style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>No hay partidos programados.</p>

  // Group matches by day
  const byKey: Record<string, Partido[]> = {}
  for (const p of proximos) {
    const k = dayKeyFromFecha(p.fecha)
    ;(byKey[k] = byKey[k] ?? []).push(p)
  }

  const now = new Date()
  const todayKey = dayKey(now.getFullYear(), now.getMonth(), now.getDate())

  const firstWeekday = new Date(view.year, view.month, 1).getDay()
  const daysInMonth  = new Date(view.year, view.month + 1, 0).getDate()
  const monthLabel   = new Date(view.year, view.month, 1)
    .toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })

  const prevMonth = () => setView(v => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }))
  const nextMonth = () => setView(v => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }))

  const sortedKeys = Object.keys(byKey).sort()
  const visibleGroups: [string, Partido[]][] = selectedKey
    ? (byKey[selectedKey] ? [[selectedKey, byKey[selectedKey]] as [string, Partido[]]] : [])
    : sortedKeys.map(k => [k, byKey[k]] as [string, Partido[]])

  return (
    <div className="calendar-layout">
      {/* ── Matches list (filtered by the selected day) ── */}
      <div className="calendar-matches">
        <div className="calendar-matches-head">
          <h3 className="jornada-title">{selectedKey ? fmtDayKey(selectedKey) : 'Todos los partidos'}</h3>
          {selectedKey && (
            <button type="button" className="cal-clear" onClick={() => setSelectedKey(null)}>
              Ver todos
            </button>
          )}
        </div>

        {visibleGroups.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>No hay partidos en esta fecha.</p>
        ) : (
          visibleGroups.map(([key, ps]) => (
            <div key={key} className="jornada-group">
              {!selectedKey && <h4 className="cal-group-date">{fmtDayKey(key)}</h4>}
              {ps.map(p => <MatchRow key={p.id_partido} p={p} />)}
            </div>
          ))
        )}
      </div>

      {/* ── Month calendar (click a day to filter) ── */}
      <div className="calendar-card">
        <div className="calendar-header">
          <button type="button" className="cal-btn" onClick={prevMonth} aria-label="Mes anterior">
            <ChevronLeft size={18} />
          </button>
          <h3 className="cal-month">{monthLabel}</h3>
          <button type="button" className="cal-btn" onClick={nextMonth} aria-label="Mes siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="calendar-grid">
          {CAL_WEEKDAYS.map(w => (
            <div key={w} className="cal-day-header">{w}</div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="cal-cell empty" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const key = dayKey(view.year, view.month, day)
            const dayMatches = byKey[key] ?? []
            const has = dayMatches.length > 0
            const cls = `cal-cell${has ? ' has-events' : ''}${key === todayKey ? ' today' : ''}${key === selectedKey ? ' selected' : ''}`
            return (
              <div
                key={key}
                className={cls}
                onClick={has ? () => setSelectedKey(k => (k === key ? null : key)) : undefined}
                role={has ? 'button' : undefined}
                tabIndex={has ? 0 : undefined}
              >
                <span className="cal-date">{day}</span>
                {has && (
                  <div className="cal-dots">
                    {dayMatches.slice(0, 3).map((m, di) => (
                      <span key={di} className="cal-dot" style={{ background: discDot(m.nombre_disciplina ?? m.torneo_nombre) }} />
                    ))}
                    {dayMatches.length > 3 && <span className="cal-more">+{dayMatches.length - 3}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function Torneos() {
  const [torneos, setTorneos]     = useState<Torneo[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<number | null>(null)
  const [torneosLoading, setTorneosLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getTorneos(),
      getDisciplinas().catch(() => [])
    ])
      .then(([tData, dData]) => {
        setTorneos(tData)
        setDisciplinas(dData)
        if (tData.length > 0) setSelectedId(tData[0].id_torneo)
      })
      .catch(() => {})
      .finally(() => setTorneosLoading(false))
  }, [])

  const filteredTorneos = selectedDisciplinaId
    ? torneos.filter(t => t.id_disciplina === selectedDisciplinaId)
    : torneos;

  useEffect(() => {
    if (selectedDisciplinaId !== null || selectedDisciplinaId === null) {
      if (filteredTorneos.length > 0 && !filteredTorneos.find(t => t.id_torneo === selectedId)) {
        setSelectedId(filteredTorneos[0].id_torneo)
      } else if (filteredTorneos.length === 0) {
        setSelectedId(null)
      }
    }
  }, [selectedDisciplinaId, torneos])

  return (
    <div className="torneos-page">
      <header className="page-header with-thin-border">
        <h1>Centro de Competiciones</h1>
        <p>Sigue de cerca el rendimiento de los equipos y no te pierdas ningún partido.</p>
      </header>
      <div className="container torneos-container">
        <div className="filters" style={{ display: 'flex', gap: '20px' }}>
          <div className="filter-group">
            <label htmlFor="disciplina"><strong>Disciplina:</strong></label>
            <select
              id="disciplina"
              value={selectedDisciplinaId ?? ''}
              onChange={e => setSelectedDisciplinaId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Todas</option>
              {disciplinas.map(d => (
                <option key={d.id_disciplina} value={d.id_disciplina}>{sportLabel(d.nombre_disciplina)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="torneo"><strong>Torneo:</strong></label>
            {torneosLoading ? (
              <span style={{ color: '#8B8B8B', fontSize: 14 }}>Cargando...</span>
            ) : filteredTorneos.length === 0 ? (
              <span style={{ color: '#8B8B8B', fontSize: 14 }}>No hay torneos activos</span>
            ) : (
              <select
                id="torneo"
                value={selectedId ?? ''}
                onChange={e => setSelectedId(Number(e.target.value))}
              >
                {filteredTorneos.map(t => (
                  <option key={t.id_torneo} value={t.id_torneo}>{t.nombre}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedId == null ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#8B8B8B' }}>
            Seleccioná un torneo para ver la información.
          </p>
        ) : (
          <Tabs
            defaultTab="posiciones"
            tabs={[
              { id: 'posiciones',   label: 'Tabla de Posiciones',  content: <StandingsTab idTorneo={selectedId} /> },
              { id: 'partidos',     label: 'Partidos & Resultados', content: <MatchesTab   idTorneo={selectedId} /> },
              { id: 'estadisticas', label: 'Estadísticas',          content: <StatsTab     idTorneo={selectedId} /> },
              { id: 'calendario',   label: 'Calendario',            content: <CalendarTab  idTorneo={selectedId} /> },
            ]}
          />
        )}
      </div>
    </div>
  )
}

export default Torneos
