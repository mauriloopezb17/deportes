import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  User,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  getNoticiasPublicadas,
  getResultadosRecientes,
  getProximosPartidos,
  getDeportistasDestacados,
  type Noticia,
  type Resultado,
  type ProximoPartido,
  type JugadorDestacado,
} from '../services/homeService'
import './Home.css'

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
}

function fmtHora(t: string) {
  return t?.slice(0, 5) ?? ''
}

const newsDate = (n: Noticia) => n.fecha_publicacion ?? n.fecha_creacion
const byDateDesc = (a: Noticia, b: Noticia) => newsDate(b).localeCompare(newsDate(a))

// Display alias: normalize the API's inconsistent discipline spellings to the
// canonical sport name (Fútbol→Futsal, Basket/Baloncesto→Básquetbol, Vóley→Voleibol).
const sportLabel = (name: string) => {
  const s = (name ?? '').toLowerCase()
  if (/futsal|f[úu]tsal|f[úu]tbol|futbol/.test(s)) return 'Futsal'
  if (/basket|b[áa]squet|baloncesto/.test(s)) return 'Básquetbol'
  if (/v[oó]le(i|y)|volley/.test(s)) return 'Voleibol'
  return name
}

/* Editorial news tile (overlay style). `feature` makes the large lead cell. */
function NewsTile({ n, feature = false }: { n: Noticia; feature?: boolean }) {
  return (
    <Link to={`/noticias/${n.id_noticia}`} className={`news-tile${feature ? ' feature' : ''} reveal`}>
      {n.imagen_portada ? (
        <img src={n.imagen_portada} alt={n.titulo} className="news-tile-bg" />
      ) : (
        <div className="news-tile-bg news-tile-bg-empty">
          <Newspaper size={feature ? 96 : 48} />
        </div>
      )}
      <div className="news-tile-shade" />
      <div className="news-tile-body">
        <span className="news-tile-tag">{n.categoria_nombre}</span>
        <h3>{n.titulo}</h3>
        {feature && n.resumen && <p>{n.resumen}</p>}
      </div>
    </Link>
  )
}

function Home() {
  const [heroNoticias, setHeroNoticias] = useState<Noticia[]>([])
  const [allNoticias, setAllNoticias]   = useState<Noticia[]>([])
  const [slide, setSlide]               = useState(0)
  const [resultados, setResultados]     = useState<Resultado[]>([])
  const [proximos, setProximos]         = useState<ProximoPartido[]>([])
  const [jugadores, setJugadores]       = useState<JugadorDestacado[]>([])

  useEffect(() => {
    getNoticiasPublicadas()
      .then((data) => {
        const sorted = [...data].sort(byDateDesc)
        setHeroNoticias(sorted.filter(n => n.categoria_nombre === 'Destacado').slice(0, 5))
        setAllNoticias(sorted)
      })
      .catch(() => {})
    getResultadosRecientes()
      .then(setResultados)
      .catch(() => {})
    getProximosPartidos()
      .then(setProximos)
      .catch(() => {})
    getDeportistasDestacados()
      .then(d => setJugadores(d.slice(0, 6)))
      .catch(() => {})
  }, [])

  // auto-advance every 6s
  useEffect(() => {
    if (heroNoticias.length <= 1) return
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % heroNoticias.length)
    }, 6000)
    return () => clearInterval(id)
  }, [heroNoticias.length])

  const goTo  = (i: number) => setSlide(((i % heroNoticias.length) + heroNoticias.length) % heroNoticias.length)
  const prev  = () => goTo(slide - 1)
  const next  = () => goTo(slide + 1)

  // Lead cell = latest "Destacado"; falls back to the latest news overall.
  const featuredNoticia = allNoticias.find(n => n.categoria_nombre === 'Destacado') ?? allNoticias[0]
  const restNoticias = allNoticias.filter(n => n.id_noticia !== featuredNoticia?.id_noticia).slice(0, 5)

  return (
    <div className="home-page">
      <header className="hero-carousel">
        {heroNoticias.length > 0 ? (
          <>
            {heroNoticias.map((n, i) => (
              <article
                key={n.id_noticia}
                className={`hero-slide${i === slide ? ' active' : ''}`}
              >
                {n.imagen_portada ? (
                  <img src={n.imagen_portada} alt={n.titulo} className="hero-slide-bg" />
                ) : (
                  <div className="hero-slide-bg hero-slide-bg-placeholder">
                    <Newspaper size={120} />
                  </div>
                )}
                <div className="hero-slide-overlay" />
                <div className="hero-slide-content">
                  <span className="hero-slide-tag">{n.categoria_nombre}</span>
                  <h1>{n.titulo}</h1>
                  {n.resumen && <p>{n.resumen}</p>}
                  <Link to={`/noticias/${n.id_noticia}`} className="btn-primary">
                    Leer noticia <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}

            {heroNoticias.length > 1 && (
              <>
                <button className="hero-arrow prev" onClick={prev} aria-label="Anterior">
                  <ChevronLeft size={28} />
                </button>
                <button className="hero-arrow next" onClick={next} aria-label="Siguiente">
                  <ChevronRight size={28} />
                </button>
                <div className="hero-dots">
                  {heroNoticias.map((_, i) => (
                    <button
                      key={i}
                      className={`hero-dot${i === slide ? ' active' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={`Ir a la noticia ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="hero-empty">
            <Newspaper size={72} />
            <h1>El deporte universitario al siguiente nivel.</h1>
            <p>Únete a las disciplinas, revisa los fixtures y apoya a tu carrera en el torneo oficial de la UCB.</p>
          </div>
        )}
      </header>

      <div className="container">
        <h2 className="section-title reveal">Centro de Partidos</h2>
        <div className="match-center">
          <div className="match-panel">
            <h3>Últimos Resultados</h3>
            {resultados.length > 0 ? (
              resultados.map((m) => (
                <div key={m.id_partido} className="match-card">
                  <div className="team-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                    <span>{m.equipo_local}</span>
                    <span style={{ fontSize: '0.75rem', color: '#8B8B8B' }}>{m.disciplina}</span>
                  </div>
                  <div className="score-box">{m.goles_local} – {m.goles_visitante}</div>
                  <div className="team-info away">{m.equipo_visitante}</div>
                </div>
              ))
            ) : (
              <p className="empty-state" style={{ textAlign: 'center', padding: '1rem', color: '#8B8B8B' }}>No hay resultados disponibles</p>
            )}
          </div>
          <div className="match-panel">
            <h3>Próximos Partidos</h3>
            {proximos.length > 0 ? (
              proximos.map((m) => (
                <div key={m.id_partido} className="match-card wrap">
                  <span className="match-meta">{fmtFecha(m.fecha)} · {m.torneo_nombre}</span>
                  <div className="team-info">{m.equipo_local}</div>
                  <div className="time-box">{fmtHora(m.hora_inicio)}</div>
                  <div className="team-info away">{m.equipo_visitante}</div>
                </div>
              ))
            ) : (
              <p className="empty-state" style={{ textAlign: 'center', padding: '1rem', color: '#8B8B8B' }}>No hay partidos programados</p>
            )}
          </div>
        </div>
        <div className="section-footer">
          <Link to="/torneos" className="btn-more">
            Ver fixture y más información <ArrowRight size={18} />
          </Link>
        </div>

        <h2 className="section-title reveal">Últimas Noticias</h2>
        {allNoticias.length > 0 ? (
          <section className="home-news-bento">
            <NewsTile n={featuredNoticia!} feature />
            {restNoticias.map((n) => (
              <NewsTile key={n.id_noticia} n={n} />
            ))}
          </section>
        ) : (
          <p className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#8B8B8B' }}>No hay noticias disponibles</p>
        )}
        <div className="section-footer">
          <Link to="/noticias" className="btn-more">
            Ver todas las noticias <ArrowRight size={18} />
          </Link>
        </div>

        <h2 className="section-title reveal">Jugadores Destacados</h2>
        <section className="home-players-grid">
          {jugadores.length > 0 ? (
            jugadores.map((j) => (
              <article key={j.id_deportista} className="home-player-card">
                {j.url_foto
                  ? <img src={j.url_foto} alt={`${j.nombres} ${j.ape_paterno}`} className="home-player-photo" />
                  : <div className="home-player-photo home-player-photo-empty"><User size={72} strokeWidth={1.4} /></div>
                }
                <div className="home-player-shade" />
                <span className="home-player-disc">{sportLabel(j.nombre_disciplina)}</span>
                <div className="home-player-meta">
                  <span className="home-player-firstname">{j.nombres}</span>
                  <h4 className="home-player-lastname">{j.ape_paterno}</h4>
                  {j.nombre_categoria && <span className="home-player-position">{j.nombre_categoria}</span>}
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#8B8B8B' }}>Sin jugadores destacados aún.</p>
          )}
        </section>
        <div className="section-footer">
          <Link to="/club" className="btn-more">
            Conoce más sobre el club <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
