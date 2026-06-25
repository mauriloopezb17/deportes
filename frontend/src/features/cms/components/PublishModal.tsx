// ── src/components/Editor/PublishModal.tsx ───────────────────────────────────

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ImagePlus, Trash2, FileText, Upload, Loader2 } from 'lucide-react';
import { uploadImagenPortada } from '../services/noticiaApi';
import 'CSS/PublishModal.css';

export interface PublishPayload {
  titulo:    string;
  resumen:   string;
  imagenUrl: string | null;
}

interface PublishModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onConfirm: (payload: PublishPayload) => void | Promise<void>;
  newsData:  any;
}

const MAX_WORDS = 100;
function countWords(t: string) {
  return t.trim() === '' ? 0 : t.trim().split(/\s+/).length;
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onConfirm, newsData }) => {
  const [titulo, setTitulo]             = useState('');
  const [resumen, setResumen]           = useState('');
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [imagenUrl, setImagenUrl]       = useState<string | null>(null);
  const [imagenNombre, setImagenNombre] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imgError, setImgError]         = useState('');
  const [dragOver, setDragOver]         = useState(false);
  const [error, setError]               = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Reset al abrir ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    setTitulo(newsData?.blocks?.find((b: any) => b.type === 'header')?.data?.text ?? '');
    setResumen('');
    // Liberar el object URL anterior si existe
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setImagenUrl(null);
    setImagenNombre(null);
    setUploadingImg(false);
    setImgError('');
    setError('');
    setIsPublishing(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Escape ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPublishing && !uploadingImg) onClose();
    };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose, isPublishing, uploadingImg]);

  const wordCount = countWords(resumen);
  const overLimit = wordCount > MAX_WORDS;
  const busy      = isPublishing || uploadingImg;

  // ── Subir imagen ────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImgError('Solo se permiten imágenes JPG o PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImgError('La imagen no puede superar 5 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setImagenNombre(file.name);
    setImgError('');
    setUploadingImg(true);

    try {
      const url = await uploadImagenPortada(file);
      setImagenUrl(url);
    } catch (err: any) {
      setImgError(`Error al subir: ${err.message}`);
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      setImagenUrl(null);
      setImagenNombre(null);
    } finally {
      setUploadingImg(false);
    }
  }, []);

  // ── Quitar imagen ───────────────────────────────────────────────────────────

  const handleRemove = () => {
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setImagenUrl(null);
    setImagenNombre(null);
    setImgError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Confirmar publicación ───────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (!titulo.trim())      { setError('El título no puede estar vacío.'); return; }
    if (titulo.length > 255) { setError('El título supera los 255 caracteres.'); return; }
    if (!resumen.trim())     { setError('El resumen no puede estar vacío.'); return; }
    if (overLimit)           { setError(`El resumen supera el límite de ${MAX_WORDS} palabras.`); return; }
    if (uploadingImg)        { setError('Espera a que termine de subir la imagen.'); return; }

    setIsPublishing(true);
    setError('');

    try {
      await onConfirm({ titulo, resumen, imagenUrl });
      // Liberar object URL al cerrar con éxito
      setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Ocurrió un error al publicar.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pm-overlay" onClick={!busy ? onClose : undefined}>
      <div className="pm-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        <div className="pm-header">
          <div className="pm-header-left">
            <FileText size={18} className="pm-header-icon" />
            <span className="pm-title">Publicar noticia</span>
          </div>
          <button className="pm-close" onClick={onClose} disabled={busy} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="pm-body">

          {/* Imagen de portada */}
          <label className="pm-label">
            Imagen de portada
            <span className="pm-label-hint">Opcional · JPG o PNG · máx. 5 MB</span>
          </label>

          {previewUrl ? (
            <div className="pm-img-preview">
              <img src={previewUrl} alt="Vista previa de portada" />
              {uploadingImg ? (
                <div className="pm-img-uploading">
                  <Loader2 size={22} className="spin" />
                  <span>Subiendo a la nube…</span>
                </div>
              ) : (
                <div className="pm-img-overlay">
                  <span className="pm-img-name">{imagenNombre}</span>
                  <button className="pm-img-remove" onClick={handleRemove} disabled={busy}>
                    <Trash2 size={15} /> Quitar imagen
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`pm-dropzone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              onClick={() => !busy && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              aria-label="Subir imagen de portada"
            >
              <ImagePlus size={28} className="pm-dz-icon" />
              <p className="pm-dz-text">
                Arrastra una imagen aquí<br />
                <span>o haz clic para seleccionar</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                style={{ display: 'none' }}
              />
            </div>
          )}
          {imgError && <p className="pm-error" style={{ marginTop: 6 }}>{imgError}</p>}

          {/* Título */}
          <label className="pm-label" style={{ marginTop: '1.25rem' }}>
            Título <span className="pm-label-hint">Máx. 255 caracteres</span>
          </label>
          <div className={`pm-input-wrap ${titulo.length > 255 ? 'over' : ''}`}>
            <input
              className="pm-input"
              type="text"
              placeholder="Título de la noticia…"
              value={titulo}
              maxLength={260}
              disabled={isPublishing}
              onChange={e => { setTitulo(e.target.value); if (error) setError(''); }}
            />
            <div className={`pm-charcount ${titulo.length > 255 ? 'over' : titulo.length > 200 ? 'warn' : ''}`}>
              {titulo.length} / 255
            </div>
          </div>

          {/* Resumen */}
          <label className="pm-label" style={{ marginTop: '1.25rem' }}>
            Resumen <span className="pm-label-hint">Aparecerá en la miniatura</span>
          </label>
          <div className={`pm-textarea-wrap ${overLimit ? 'over' : ''}`}>
            <textarea
              className="pm-textarea"
              placeholder="Escribe un resumen breve…"
              value={resumen}
              disabled={isPublishing}
              rows={4}
              onChange={e => { setResumen(e.target.value); if (error) setError(''); }}
            />
            <div className={`pm-wordcount ${overLimit ? 'over' : wordCount >= 80 ? 'warn' : ''}`}>
              {wordCount} / {MAX_WORDS} palabras
            </div>
          </div>

          {error && <p className="pm-error">{error}</p>}
        </div>

        <div className="pm-footer">
          <button className="pm-btn pm-btn-cancel" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            className="pm-btn pm-btn-publish"
            onClick={handleConfirm}
            disabled={overLimit || titulo.length > 255 || busy}
          >
            {isPublishing
              ? <><Loader2 size={15} className="spin" /> Publicando…</>
              : <><Upload size={15} /> Publicar</>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublishModal;