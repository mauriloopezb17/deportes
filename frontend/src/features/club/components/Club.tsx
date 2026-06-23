import { useState, useEffect } from 'react'
import { Search, User, Clock, MapPin } from 'lucide-react'
import Tabs from './Tabs'
import {
  getHorarios,
  getEntrenadores,
  getJugadoresDestacados,
  type EntrenadorRow,
  type Horario,
  type JugadorDestacado,
} from '../services/clubService'
import './Club.css'

interface Entrenador {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  url_foto: string | null
  asignaciones: { nombre_disciplina: string; nombre_categoria: string }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Disciplines arrive from the API with inconsistent spellings (Fútbol/Futsal,
// Básquetbol/Basket/Baloncesto, Voleibol/Vóley/Volley...). Collapse them to the
// three canonical sports so filtering & labels are uniform everywhere.
const SPORTS = ['Futsal', 'Básquetbol', 'Voleibol'] as const
type Sport = (typeof SPORTS)[number]

function canonicalSport(name: string): Sport | null {
  const s = (name ?? '').toLowerCase()
  if (/futsal|f[úu]tsal|f[úu]tbol|futbol/.test(s)) return 'Futsal'
  if (/basket|b[áa]squet|baloncesto/.test(s)) return 'Básquetbol'
  if (/v[oó]le(i|y)|volley/.test(s)) return 'Voleibol'
  return null
}

const sportLabel = (name: string) => canonicalSport(name) ?? name

// Reusable sport filter: shows "Todas" + only the canonical sports present in `names`.
function SportFilter({ names, value, onChange }: {
  names: string[]; value: string; onChange: (v: string) => void
}) {
  const present = SPORTS.filter(sp => names.some(n => canonicalSport(n) === sp))
  return (
    <div className="sport-filter">
      {['Todas', ...present].map(opt => (
        <button
          key={opt}
          type="button"
          className={`sport-chip${opt === value ? ' active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

const DISC_COLORS = ['#1e40af', '#166534', '#9a3412', '#6d28d9', '#0e7490', '#b45309', '#be185d']

function discColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return DISC_COLORS[Math.abs(h) % DISC_COLORS.length]
}

function fmtHora(t: string) {
  return t?.slice(0, 5) ?? ''
}

// Weekday handling for the schedule planner. `dia_semana` may arrive as a name
// ("Lunes") or as a number — ISO 1=Mon..7=Sun, also tolerating 0=Sun (JS style).
const DAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAY_BY_NUM: Record<string, string> = {
  '0': 'Domingo', '1': 'Lunes', '2': 'Martes', '3': 'Miércoles',
  '4': 'Jueves', '5': 'Viernes', '6': 'Sábado', '7': 'Domingo',
}
const dayName = (d: string | number) => {
  const raw = String(d ?? '').trim()
  return DAY_BY_NUM[raw] ?? raw
}
const normDay = (d: string) =>
  (d ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const dayIndex = (d: string) => DAY_ORDER.findIndex(x => normDay(x) === normDay(d))

function groupEntrenadores(rows: EntrenadorRow[]): Entrenador[] {
  const map = new Map<number, Entrenador>()
  for (const r of rows) {
    if (!map.has(r.id_entrenador)) {
      map.set(r.id_entrenador, {
        id_entrenador: r.id_entrenador,
        nombres: r.nombres,
        ape_paterno: r.ape_paterno,
        ape_materno: r.ape_materno,
        url_foto: r.url_foto,
        asignaciones: [],
      })
    }
    map.get(r.id_entrenador)!.asignaciones.push({
      nombre_disciplina: r.nombre_disciplina,
      nombre_categoria: r.nombre_categoria,
    })
  }
  return Array.from(map.values())
}

// ── Tab: Horarios ─────────────────────────────────────────────────────────────

function HorariosTab() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState('Todas')

  useEffect(() => {
    getHorarios()
      .then(setHorarios).catch(() => setHorarios([])).finally(() => setLoading(false))
  }, [])

  const filtered = selected === 'Todas' ? horarios : horarios.filter(h => canonicalSport(h.nombre_disciplina) === selected)

  // Group sessions into weekday columns (Mon→Sun), each sorted by start time.
  const byDay: Record<string, Horario[]> = {}
  for (const h of filtered) (byDay[dayName(h.dia_semana)] ??= []).push(h)
  const days = Object.keys(byDay).sort((a, b) => {
    const ia = dayIndex(a), ib = dayIndex(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
  for (const d of days) byDay[d].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))

  const todayName = new Date().toLocaleDateString('es-BO', { weekday: 'long' })

  return (
    <>
      <SportFilter
        names={horarios.map(h => h.nombre_disciplina)}
        value={selected}
        onChange={setSelected}
      />

      {loading ? (
        <p className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>Cargando...</p>
      ) : days.length === 0 ? (
        <p className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>Sin horarios disponibles.</p>
      ) : (
        <div className="week-board">
          {days.map(day => (
            <div key={day} className={`week-col${normDay(day) === normDay(todayName) ? ' is-today' : ''}`}>
              <div className="week-col-head">
                <span className="week-day">{day}</span>
                <span className="week-count">{byDay[day].length}</span>
              </div>
              <div className="week-col-body">
                {byDay[day].map((h, i) => {
                  const key = canonicalSport(h.nombre_disciplina) ?? h.nombre_disciplina
                  const coach = [h.entrenador_nombres, h.entrenador_apellido].filter(Boolean).join(' ')
                  return (
                    <div key={i} className="session reveal" style={{ borderLeftColor: discColor(key) }}>
                      <div className="session-time">
                        <Clock size={13} /> {fmtHora(h.hora_inicio)} – {fmtHora(h.hora_fin)}
                      </div>
                      <div className="session-disc">
                        <span className="session-dot" style={{ background: discColor(key) }} />
                        {sportLabel(h.nombre_disciplina)}
                      </div>
                      <div className="session-meta"><MapPin size={12} /> {h.nombre_espacio}</div>
                      {coach && <div className="session-meta"><User size={12} /> {coach}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="horarios-note">
        * Los horarios pueden modificarse en temporada de exámenes. Confirmá con tu entrenador.
      </p>
    </>
  )
}

// ── Tab: Entrenadores ─────────────────────────────────────────────────────────

function EntrenadoresTab() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [loading, setLoading]           = useState(true)
  const [sport, setSport]               = useState('Todas')

  useEffect(() => {
    getEntrenadores()
      .then(rows => setEntrenadores(groupEntrenadores(rows)))
      .catch(() => setEntrenadores([]))
      .finally(() => setLoading(false))
  }, [])

  const names = entrenadores.flatMap(e => e.asignaciones.map(a => a.nombre_disciplina))
  const visible = sport === 'Todas'
    ? entrenadores
    : entrenadores.filter(e => e.asignaciones.some(a => canonicalSport(a.nombre_disciplina) === sport))

  return (
    <>
      <SportFilter names={names} value={sport} onChange={setSport} />
      {loading ? (
        <p className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>Cargando...</p>
      ) : visible.length === 0 ? (
        <p className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>Sin entrenadores registrados.</p>
      ) : (
      <div className="coaches-grid">
      {visible.map(e => {
        const nombre = `${e.nombres} ${e.ape_paterno}${e.ape_materno ? ` ${e.ape_materno}` : ''}`
        return (
          <article key={e.id_entrenador} className="coach-card reveal">
            <div className="coach-top">
              <div className="coach-photo">
                {e.url_foto
                  ? <img src={e.url_foto} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <User size={56} />
                }
              </div>
              <div className="coach-header-info">
                <h3>{nombre}</h3>
                <div className="coach-disciplines">
                  {e.asignaciones.map((a, i) => (
                    <span key={i} className="coach-disc-tag">{sportLabel(a.nombre_disciplina)}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="coach-body">
              {e.asignaciones.map((a, i) => (
                <p key={i} style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  {sportLabel(a.nombre_disciplina)} — {a.nombre_categoria}
                </p>
              ))}
            </div>
          </article>
        )
      })}
      </div>
      )}
    </>
  )
}

// ── Tab: Jugadores ────────────────────────────────────────────────────────────

function PlayersTab() {
  const [jugadores, setJugadores] = useState<JugadorDestacado[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [discFilter, setDiscFilter] = useState('Todas')

  useEffect(() => {
    getJugadoresDestacados()
      .then(setJugadores).catch(() => setJugadores([])).finally(() => setLoading(false))
  }, [])

  const visible = jugadores.filter(j => {
    const nombre = `${j.nombres} ${j.ape_paterno}`.toLowerCase()
    const matchSearch = nombre.includes(search.toLowerCase())
    const matchDisc   = discFilter === 'Todas' || canonicalSport(j.nombre_disciplina) === discFilter
    return matchSearch && matchDisc
  })

  return (
    <>
      <div className="roster-filters">
        <div className="search-area">
          <Search size={18} />
          <input type="text" placeholder="Buscar jugador por nombre..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <SportFilter
          names={jugadores.map(j => j.nombre_disciplina)}
          value={discFilter}
          onChange={setDiscFilter}
        />
      </div>

      <div className="players-grid">
        {loading ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#8B8B8B' }}>Cargando...</p>
        ) : visible.length === 0 ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#8B8B8B' }}>Sin jugadores destacados.</p>
        ) : visible.map(j => {
          const nombre = `${j.nombres} ${j.ape_paterno}${j.ape_materno ? ` ${j.ape_materno}` : ''}`
          const apellidos = `${j.ape_paterno}${j.ape_materno ? ` ${j.ape_materno}` : ''}`
          return (
            <article key={j.id_deportista} className="player-card">
              {j.url_foto
                ? <img src={j.url_foto} alt={nombre} className="player-photo" />
                : <div className="player-photo player-photo-empty"><User size={72} strokeWidth={1.4} /></div>
              }
              <div className="player-shade" />
              <span className="player-disc">{sportLabel(j.nombre_disciplina)}</span>
              <div className="player-meta">
                <span className="player-firstname">{j.nombres}</span>
                <h3 className="player-lastname">{apellidos}</h3>
                {j.nombre_categoria && <span className="player-position">{j.nombre_categoria}</span>}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function Club() {
  return (
    <div className="club-page">
      <header className="page-header">
        <h1>Conoce a tu Club</h1>
        <p>Nuestro roster oficial, cuerpo técnico, horarios y los mejores momentos de nuestros atletas.</p>
      </header>
      <div className="container club-container">
        <Tabs
          align="center"
          defaultTab="jugadores"
          tabs={[
            { id: 'jugadores',    label: 'Jugadores',      content: <PlayersTab /> },
            { id: 'entrenadores', label: 'Cuerpo Técnico', content: <EntrenadoresTab /> },
            { id: 'horarios',     label: 'Horarios',       content: <HorariosTab /> },
          ]}
        />
      </div>
    </div>
  )
}

export default Club
