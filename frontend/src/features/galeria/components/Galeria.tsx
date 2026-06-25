import { useEffect, useState } from 'react'
import { Camera, Play, X } from 'lucide-react'
import { getGaleriaEventos, type GaleriaEvento } from '../services/galeriaService'
import './Galeria.css'

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
}

type Filter = 'todos' | 'fotos' | 'videos'

function Galeria() {
  const [items, setItems]       = useState<GaleriaEvento[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Filter>('todos')
  const [lightbox, setLightbox] = useState<GaleriaEvento | null>(null)

  useEffect(() => {
    getGaleriaEventos()
      .then(setItems).catch(() => setItems([])).finally(() => setLoading(false))
  }, [])

  // Close the lightbox with Escape.
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const fotos   = items.filter(i => i.tipo_archivo === 'foto')
  const videos  = items.filter(i => i.tipo_archivo === 'video')
  const visible = filter === 'fotos' ? fotos : filter === 'videos' ? videos : items

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: 'todos',  label: 'Todos',  count: items.length },
    { id: 'fotos',  label: 'Fotos',  count: fotos.length },
    { id: 'videos', label: 'Videos', count: videos.length },
  ]

  return (
    <div className="galeria-page">
      <header className="page-header with-thin-border">
        <h1>Galería</h1>
        <p>Los mejores momentos de nuestros atletas, capturados dentro y fuera de la cancha.</p>
      </header>

      <div className="container galeria-container">
        <div className="galeria-filter">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              className={`galeria-chip${filter === t.id ? ' active' : ''}`}
              onClick={() => setFilter(t.id)}
            >
              {t.label} <span className="galeria-chip-count">{loading ? '…' : t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="galeria-status">Cargando galería...</p>
        ) : visible.length === 0 ? (
          <p className="galeria-status">Sin contenido disponible.</p>
        ) : (
          <div className="masonry">
            {visible.map(item => {
              const isVideo = item.tipo_archivo === 'video'
              return (
                <button
                  key={item.id_multimedia}
                  type="button"
                  className="masonry-item reveal"
                  onClick={() => setLightbox(item)}
                  aria-label={isVideo ? 'Ver video' : 'Ver foto'}
                >
                  {isVideo ? (
                    <video src={item.url_archivo} className="masonry-media" preload="metadata" muted playsInline />
                  ) : (
                    <img
                      src={item.url_archivo}
                      alt=""
                      className="masonry-media"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget.closest('.masonry-item') as HTMLElement)?.style.setProperty('display', 'none') }}
                    />
                  )}
                  <div className="masonry-overlay">
                    <span className="masonry-type">{isVideo ? <Play size={15} /> : <Camera size={15} />}</span>
                    <span className="masonry-date">{fmtFecha(item.fecha_subida)}</span>
                  </div>
                  {isVideo && <span className="masonry-play"><Play size={24} fill="#ffffff" /></span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Cerrar">
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            {lightbox.tipo_archivo === 'video' ? (
              <video src={lightbox.url_archivo} className="lightbox-media" controls autoPlay />
            ) : (
              <img src={lightbox.url_archivo} alt="" className="lightbox-media" />
            )}
            <p className="lightbox-date">{fmtFecha(lightbox.fecha_subida)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Galeria
