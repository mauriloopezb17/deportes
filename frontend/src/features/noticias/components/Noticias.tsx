import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { getNoticiasPublicadas, type Noticia } from '../services/noticiasService'
import './Noticias.css'

const newsDate = (n: Noticia) => n.fecha_publicacion ?? n.fecha_creacion
const byDateDesc = (a: Noticia, b: Noticia) => newsDate(b).localeCompare(newsDate(a))

/* Editorial news tile (overlay style). `feature` makes the large lead cell. */
function NewsTile({ n, feature = false }: { n: Noticia; feature?: boolean }) {
  return (
    <Link to={`/noticias/${n.id_noticia}`} className={`news-tile${feature ? ' feature' : ''} reveal`}>
      {n.imagen_portada ? (
        <img src={n.imagen_portada} alt={n.titulo} className="news-tile-bg" />
      ) : (
        <div className="news-tile-bg news-tile-bg-empty">
          <Newspaper size={feature ? 110 : 56} />
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

function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCat, setActiveCat] = useState('Todas')

  useEffect(() => {
    getNoticiasPublicadas()
      .then((data) => setNoticias([...data].sort(byDateDesc)))
      .catch(() => setError('No se pudieron cargar las noticias.'))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['Todas', ...Array.from(new Set(noticias.map((n) => n.categoria_nombre)))]
  const filtered = activeCat === 'Todas' ? noticias : noticias.filter((n) => n.categoria_nombre === activeCat)
  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div className="noticias-page">
      <header className="page-header with-thin-border">
        <h1>Centro de Noticias</h1>
        <p>Mantente al día con los eventos y logros de nuestra comunidad deportiva.</p>
      </header>
      <div className="container news-container">
        {loading && <p className="news-status">Cargando noticias...</p>}
        {error && <p className="news-status news-error">{error}</p>}
        {!loading && !error && noticias.length === 0 && (
          <p className="news-status">No hay noticias publicadas aún.</p>
        )}

        {!loading && !error && noticias.length > 0 && (
          <>
            <div className="news-filter">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`news-chip${c === activeCat ? ' active' : ''}`}
                  onClick={() => setActiveCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="news-status">No hay noticias en esta categoría.</p>
            ) : (
              <section className="news-bento">
                <NewsTile n={featured!} feature />
                {rest.map((n) => (
                  <NewsTile key={n.id_noticia} n={n} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Noticias
