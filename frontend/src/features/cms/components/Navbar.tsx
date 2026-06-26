import React, { useState, useEffect, useRef } from 'react';
import { Upload, Eye, EyeOff, LogOut, Menu, X, Loader2 } from 'lucide-react';
import './CSS/Navbar.css';

export type SaveStatus =
  | 'nuevo'
  | 'guardando'
  | 'guardado'
  | 'publicando'
  | 'publicado'
  | 'error';

interface NavbarProps {
  onTogglePreview:  () => void;
  onPublish:        () => void;
  isShowingPreview: boolean;
  saveStatus:       SaveStatus;
  userName?:        string;
}

const STATUS_LABEL: Record<SaveStatus, string> = {
  nuevo:      'Sin guardar',
  guardando:  'Guardando…',
  guardado:   'Borrador guardado',
  publicando: 'Publicando…',
  publicado:  'Publicado',
  error:      'Error al guardar',
};

const STATUS_CLASS: Record<SaveStatus, string> = {
  nuevo:      'status-nuevo',
  guardando:  'status-loading',
  guardado:   'status-ok',
  publicando: 'status-loading',
  publicado:  'status-published',
  error:      'status-error',
};

const isLoading = (s: SaveStatus) => s === 'guardando' || s === 'publicando';

const Navbar: React.FC<NavbarProps> = ({
  onTogglePreview,
  onPublish,
  isShowingPreview,
  saveStatus,
  userName = 'Usuario',
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const h = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const handleAction = (fn: () => void) => { fn(); setMenuOpen(false); };

  return (
    <nav className="navbar-cms">
      <div className="navbar-left">
        <span className="welcome-text">Hola, <strong>{userName}</strong></span>
        <div className="navbar-divider" />
        <span className="navbar-page-title">Noticias</span>
      </div>

      {/* Indicador de estado */}
      <div className={`navbar-status ${STATUS_CLASS[saveStatus]}`}>
        {isLoading(saveStatus) && <Loader2 size={12} className="spin" />}
        <span>{STATUS_LABEL[saveStatus]}</span>
      </div>

      {/* Acciones desktop */}
      <div className="navbar-actions navbar-desktop">
        <button
          className={`action-btn btn-preview ${isShowingPreview ? 'active' : ''}`}
          onClick={onTogglePreview}
          title={isShowingPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
        >
          {isShowingPreview ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>{isShowingPreview ? 'OCULTAR' : 'VISTA PREVIA'}</span>
        </button>

        <button
          className="action-btn btn-publish-main"
          onClick={onPublish}
          title="Publicar noticia"
          disabled={isLoading(saveStatus)}
        >
          <Upload size={15} />
          <span>PUBLICAR</span>
        </button>

        <div className="navbar-divider" />

        <button className="logout-icon-btn" title="Cerrar sesión">
          <LogOut size={16} />
        </button>
      </div>

      {/* Hamburguesa */}
      <button
        className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(p => !p)}
        aria-label="Abrir menú"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuOpen && (
        <div className="navbar-mobile-menu" ref={menuRef}>
          <div className="mobile-divider" />
          <button
            className={`mobile-action-btn ${isShowingPreview ? 'active' : ''}`}
            onClick={() => handleAction(onTogglePreview)}
          >
            {isShowingPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{isShowingPreview ? 'Ocultar vista previa' : 'Vista previa'}</span>
          </button>
          <button
            className="mobile-action-btn mobile-publish"
            onClick={() => handleAction(onPublish)}
            disabled={isLoading(saveStatus)}
          >
            <Upload size={16} />
            <span>Publicar</span>
          </button>
          <div className="mobile-divider" />
          <button className="mobile-action-btn mobile-logout">
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;