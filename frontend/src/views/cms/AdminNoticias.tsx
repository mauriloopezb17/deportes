import React, { useState, useCallback, useEffect, useRef } from 'react';
import Navbar from '../../features/cms/components/Navbar';
import type { SaveStatus } from '../../features/cms/components/Navbar';
import EditorNoticias from '../../features/cms/components/EditorNoticias';
import PublishModal from '../../features/cms/components/PublishModal';
import type { PublishPayload } from '../../features/cms/components/PublishModal';
import * as noticiaApi from '../../features/cms/services/noticiaApi';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import './AdminNoticias.css';

interface NoticiaItem {
  id_noticia: number;
  titulo: string;
  publicado: boolean;
  fecha_creacion: string;
  categoria_nombre: string;
  contenido: any;
  resumen: string | null;
  id_categoria_noticia: number;
}

function extractTitle(data: any): string {
  return data?.blocks?.find((b: any) => b.type === 'header')?.data?.text ?? 'Sin título';
}

const AdminNoticias: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
 

  // newsDataRef siempre tiene el valor más reciente de newsData,
  // evitando stale closures en handleSave / handlePublish / handleModalConfirm
  const newsDataRef   = useRef<any>(null);
  const [newsData, setNewsData]       = useState<any>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>('nuevo');
  const [categorias, setCategorias]   = useState<noticiaApi.Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [editorKey, setEditorKey]     = useState(0);
  const [initialEditorData, setInitialEditorData] = useState<any>(undefined);
  const [noticias, setNoticias]       = useState<NoticiaItem[]>([]);
  const [listStatus, setListStatus]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [panelTop, setPanelTop]       = useState(90);

  // Refs para evitar stale closures en callbacks
  const noticiaIdRef   = useRef<number | null>(null);
  const categoriaIdRef = useRef<number | null>(null);
  const saveStatusRef  = useRef<SaveStatus>('nuevo');

  // ── Sincronizar refs ──────────────────────────────────────────────────────

  const setId = (id: number | null) => {
    noticiaIdRef.current = id;
  };

  const updateCategoriaId = (id: number | null) => {
    categoriaIdRef.current = id;
    setCategoriaId(id);
  };

  const updateSaveStatus = (s: SaveStatus) => {
    saveStatusRef.current = s;
    setSaveStatus(s);
  };

  // ── Montaje ───────────────────────────────────────────────────────────────

  useEffect(() => {
    noticiaApi.getCategorias()
      .then(cats => {
        setCategorias(cats);
        if (cats.length > 0) updateCategoriaId(cats[0].id_categoria_noticia);
      })
      .catch(console.error);
    loadNoticias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  // ── Panel top dinámico ────────────────────────────────────────────────────

  useEffect(() => {
    const update = () => {
      const navbar  = document.querySelector('.navbar-cms');
      const ribbon  = document.querySelector('.ribbon-toolbar');
      if (navbar && ribbon) {
        setPanelTop(
          navbar.getBoundingClientRect().height +
          ribbon.getBoundingClientRect().height,
        );
      }
    };
    update();
    const ro = new ResizeObserver(update);
    const navbar = document.querySelector('.navbar-cms');
    const ribbon = document.querySelector('.ribbon-toolbar');
    if (navbar) ro.observe(navbar);
    if (ribbon) ro.observe(ribbon);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  // ── Cargar lista ──────────────────────────────────────────────────────────

  const loadNoticias = () => {
    apiFetch<NoticiaItem[]>('/api/noticias/')
      .then(setNoticias)
      .catch(console.error);
  };

  // ── onDataChange — estable, sin saveStatus como dep ──────────────────────

  const handleDataChange = useCallback((data: any) => {
    newsDataRef.current = data;
    setNewsData(data);
    // Lee el estado actual desde la ref para evitar stale closure
    if (saveStatusRef.current === 'guardado' || saveStatusRef.current === 'publicado') {
      updateSaveStatus('nuevo');
    }
  }, []); // sin dependencias → siempre estable

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const data = newsDataRef.current;
    if (!data?.blocks?.length)    { alert('El editor está vacío.'); return; }
    if (!categoriaIdRef.current)  { alert('Selecciona una categoría.'); return; }

    updateSaveStatus('guardando');
    try {
      const result = await noticiaApi.saveNoticia(
        { titulo: extractTitle(data), contenido: data, id_categoria_noticia: categoriaIdRef.current! },
        noticiaIdRef.current,
      );
      setId(result.id);
      if (result.contenido) {
        newsDataRef.current = result.contenido;
        setNewsData(result.contenido);
      }
      updateSaveStatus('guardado');
      loadNoticias();
    } catch (err: any) {
      updateSaveStatus('error');
      alert(`Error al guardar: ${err.message}`);
    }
  }, []); // sin dependencias → estable

  // ── Publicar (abre modal) ─────────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    const data = newsDataRef.current;
    if (!data?.blocks?.length)   { alert('El editor está vacío.'); return; }
    if (!categoriaIdRef.current) { alert('Selecciona una categoría.'); return; }

    updateSaveStatus('guardando');
    try {
      const result = await noticiaApi.saveNoticia(
        { titulo: extractTitle(data), contenido: data, id_categoria_noticia: categoriaIdRef.current! },
        noticiaIdRef.current,
      );
      setId(result.id);
      if (result.contenido) {
        newsDataRef.current = result.contenido;
        setNewsData(result.contenido);
      }
      updateSaveStatus('guardado');
    } catch (err: any) {
      updateSaveStatus('error');
      alert(`Error al guardar antes de publicar: ${err.message}`);
      return;
    }
    setShowModal(true);
  }, []); // estable

  // ── Confirmar publicación desde el modal ──────────────────────────────────

  const handleModalConfirm = useCallback(async (payload: PublishPayload): Promise<void> => {
    if (!noticiaIdRef.current || !categoriaIdRef.current) return;

    updateSaveStatus('publicando');
    try {
      await noticiaApi.publishNoticia(noticiaIdRef.current, {
        titulo:               payload.titulo,
        contenido:            newsDataRef.current,
        id_categoria_noticia: categoriaIdRef.current!,
        resumen:              payload.resumen,
        imagenUrl:            payload.imagenUrl,
      });
      updateSaveStatus('publicado');
      loadNoticias();
    } catch (err: any) {
      updateSaveStatus('error');
      throw err; // PublishModal lo captura y muestra en su propio error state
    }
  }, []); // estable

  // ── Editar noticia existente ──────────────────────────────────────────────

  const handleEdit = (n: NoticiaItem) => {
    setId(n.id_noticia);
    updateCategoriaId(n.id_categoria_noticia);
    newsDataRef.current = n.contenido ?? undefined;
    setInitialEditorData(n.contenido ?? undefined);
    setEditorKey(k => k + 1);
    updateSaveStatus('guardado');
    setListStatus(null);
    setPanelOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Eliminar noticia ──────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia permanentemente?')) return;
    try {
      await apiFetch(`/api/noticias/${id}`, { method: 'DELETE' });
      if (noticiaIdRef.current === id) resetEditor();
      loadNoticias();
    } catch (e: any) {
      setListStatus({ type: 'error', msg: e.message ?? 'Error al eliminar.' });
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const resetEditor = () => {
    setId(null);
    newsDataRef.current = null;
    setInitialEditorData(undefined);
    setEditorKey(k => k + 1);
    updateSaveStatus('nuevo');
  };

  const togglePreview = useCallback(() => setShowSidebar(p => !p), []);

  const displayName = user
    ? `${user.nombres ?? ''} ${user.ape_paterno ?? ''}`.trim() || user.email
    : 'Admin';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="an-root">
      <Navbar
        onTogglePreview={togglePreview}
        isShowingPreview={showSidebar}
        onPublish={handlePublish}
        saveStatus={saveStatus}
        userName={displayName}
      />

      <div className="an-body">
        <main className="an-main">
          <EditorNoticias
            key={editorKey}
            onDataChange={handleDataChange}
            onPublish={handlePublish}
            onSave={handleSave}
            isShowingPreview={showSidebar}
            newsData={newsData}
            saveStatus={saveStatus}
            categorias={categorias}
            categoriaId={categoriaId}
            onCategoriaChange={id => {
              categoriaIdRef.current = id;
              setCategoriaId(id);
            }}
            initialData={initialEditorData}
          />
        </main>
      </div>

      {/* ── Botón flotante ── */}
      <button
        className={`an-panel-toggle ${panelOpen ? 'open' : ''}`}
        onClick={() => setPanelOpen(p => !p)}
        title={panelOpen ? 'Cerrar panel' : 'Ver noticias guardadas'}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.3s ease', transform: panelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {!panelOpen && noticias.length > 0 && (
          <span className="an-toggle-badge">{noticias.length}</span>
        )}
      </button>

      {/* ── Overlay ── */}
      {panelOpen && (
        <div className="an-panel-overlay" onClick={() => setPanelOpen(false)} />
      )}

      {/* ── Panel deslizante ── */}
      <aside
        className={`an-news-panel ${panelOpen ? 'open' : ''}`}
        style={{ top: panelTop }}
      >
        <div className="an-panel-header">
          <h4 className="an-panel-title">
            Noticias
            <span className="an-panel-count">{noticias.length}</span>
          </h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {noticiaIdRef.current && (
              <button className="an-new-btn" onClick={() => { resetEditor(); setPanelOpen(false); }}>
                + Nueva
              </button>
            )}
            <button className="an-panel-close" onClick={() => setPanelOpen(false)}>✕</button>
          </div>
        </div>

        {listStatus && (
          <div className={`an-status an-status-${listStatus.type}`}>{listStatus.msg}</div>
        )}

        <div className="an-panel-list">
          {noticias.length === 0 ? (
            <p className="an-list-empty">No hay noticias aún.</p>
          ) : (
            noticias.map((n) => (
              <div
                key={n.id_noticia}
                className={`an-news-item ${noticiaIdRef.current === n.id_noticia ? 'active' : ''}`}
              >
                <div className="an-news-item-info">
                  <span className={`an-pub-badge ${n.publicado ? 'published' : 'draft'}`}>
                    {n.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                  <span className="an-news-item-title">{n.titulo}</span>
                  <span className="an-news-item-cat">{n.categoria_nombre}</span>
                </div>
                <div className="an-news-item-actions">
                  <button className="an-item-btn edit"   onClick={() => handleEdit(n)}>Editar</button>
                  <button className="an-item-btn delete" onClick={() => handleDelete(n.id_noticia)}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <PublishModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        newsData={newsData}
      />
    </div>
  );
};

export default AdminNoticias;