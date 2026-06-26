import React, { useEffect, useRef, useState, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
// @ts-ignore
import ColorPlugin from 'editorjs-text-color-plugin';
// @ts-ignore
import AlignmentBlockTune from 'editorjs-text-alignment-blocktune';

import {
  Trash2, Undo2, Redo2,
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  HelpCircle, Save, Loader2, Check,
} from 'lucide-react';

// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import Underline from '@editorjs/underline';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Table from '@editorjs/table';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';

import './CSS/EditorNoticias.css';
import ModalAyuda from './ModalAyuda';
import PreviewNoticia from '../components/PreviewNoticia';
import type { SaveStatus } from '../components/Navbar';
import type { Categoria } from '../services/noticiaApi';
import { uploadImagen } from '../services/noticiaApi';

// ── Props ─────────────────────────────────────────────────────────────────────

interface EditorProps {
  onDataChange:      (data: any) => void;
  onPublish:         () => void;
  onSave:            () => void;
  isShowingPreview:  boolean;
  newsData:          any;
  saveStatus:        SaveStatus;
  categorias:        Categoria[];
  categoriaId:       number | null;
  onCategoriaChange: (id: number) => void;
  initialData?:      any;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SaveIcon({ status }: { status: SaveStatus }) {
  if (status === 'guardando' || status === 'publicando')
    return <Loader2 size={15} className="spin" />;
  if (status === 'guardado' || status === 'publicado')
    return <Check size={15} />;
  return <Save size={15} />;
}

function saveLabel(status: SaveStatus): string {
  if (status === 'guardando')  return 'Guardando…';
  if (status === 'guardado')   return 'Guardado';
  if (status === 'publicando') return 'Publicando…';
  if (status === 'publicado')  return 'Guardado';
  if (status === 'error')      return 'Error';
  return 'Guardar';
}

// ── Componente ────────────────────────────────────────────────────────────────

const EditorNoticias: React.FC<EditorProps> = ({
  onDataChange,
  onPublish,
  isShowingPreview,
  newsData,
  onSave,
  saveStatus,
  categorias,
  categoriaId,
  onCategoriaChange,
  initialData,
}) => {
  const ejInstance  = useRef<EditorJS | null>(null);
  const editorRef   = useRef<HTMLDivElement>(null);

  const [showHelp, setShowHelp]       = useState(false);
  const [fontSize, setFontSize]       = useState<number>(16);
  const [activeAlign, setActiveAlign] = useState<string>('left');

  const isBusy = saveStatus === 'guardando' || saveStatus === 'publicando';

  // ── Helpers internos ────────────────────────────────────────────────────────

  const isInsideEditor = useCallback((node: Node | null): boolean => {
    if (!editorRef.current || !node) return false;
    return editorRef.current.contains(node);
  }, []);

  const applyCommand = useCallback((command: string, value?: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    if (!isInsideEditor(sel.anchorNode)) return;
    document.execCommand(command, false, value ?? '');
  }, [isInsideEditor]);

  // Envuelve la selección en un <span> con el estilo dado
  const wrapSelectionWithSpan = useCallback((styleProp: 'fontSize' | 'fontFamily', value: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    if (!isInsideEditor(sel.anchorNode)) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style[styleProp] = value;
    try {
      range.surroundContents(span);
    } catch {
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    }
    sel.removeAllRanges();
  }, [isInsideEditor]);

  // ── Alineación via API de EditorJS ─────────────────────────────────────────

  const applyAlign = useCallback(async (align: string) => {
    if (!ejInstance.current) return;
    try {
      await ejInstance.current.isReady;
      const idx = ejInstance.current.blocks.getCurrentBlockIndex();
      if (idx === -1) return;

      const saved = await ejInstance.current.save();
      const block = saved.blocks[idx];
      if (!block) return;

      // blocks.update(id, data, tunes) actualiza la data y los tunes del bloque
      // preservando el contenido existente y solo cambiando la alineación
      ejInstance.current.blocks.update(block.id!, block.data, {
        alignmentTune: { alignment: align },
      });

      setActiveAlign(align);
    } catch (e) {
      console.error('Error aplicando alineación', e);
    }
  }, []);

  // Detectar alineación del bloque activo al cambiar selección
  const detectAlign = useCallback(async () => {
    if (!ejInstance.current) return;
    try {
      await ejInstance.current.isReady;
      const idx = ejInstance.current.blocks.getCurrentBlockIndex();
      if (idx === -1) return;
      const saved = await ejInstance.current.save();
      const block = saved.blocks[idx];
      if (!block) return;
      const tuneAlign = block.tunes?.alignmentTune?.alignment;
      setActiveAlign(tuneAlign ?? 'left');
    } catch {
      // silencioso
    }
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 's') { e.preventDefault(); onSave(); }
      if (e.key === 'p') { e.preventDefault(); onPublish(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onSave, onPublish]);

  // ── Inicialización EditorJS ─────────────────────────────────────────────────

  useEffect(() => {
    if (!ejInstance.current && editorRef.current) {
      const editor = new EditorJS({
        holder: editorRef.current,
        data: initialData ?? undefined,
        placeholder: 'Haga clic aquí para empezar a escribir su noticia...',
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  'Click to tune':   'Haga clic para ajustar',
                  'or drag to move': 'o arrastre para mover',
                },
              },
              inlineToolbar: { converter: { 'Convert to': 'Convertir a' } },
              toolbar: { toolbox: { Add: 'Agregar', Filter: 'Buscar herramienta...' } },
            },
            blockTunes: {
              delete:   { 'Delete': 'Eliminar', 'Click to delete': 'Clic para confirmar' },
              moveUp:   { 'Move up': 'Mover arriba' },
              moveDown: { 'Move down': 'Mover abajo' },
            },
            toolNames: {
              Text:             'Texto',
              Heading:          'Título / Encabezado',
              'Unordered List': 'Lista de viñetas',
              'Ordered List':   'Lista numerada',
              Checklist:        'Lista de tareas',
              Quote:            'Cita',
              Table:            'Tabla',
              Image:            'Imagen',
              Delimiter:        'Línea divisoria',
            },
          },
        },
        tools: {
          // ── Tune de alineación (se adjunta a los bloques abajo) ──────────
          alignmentTune: {
            class: AlignmentBlockTune,
            config: {
              default: 'left',
              blocks: {
                header:    'left',
                paragraph: 'left',
              },
            },
          },

          // ── Bloques de contenido ─────────────────────────────────────────
          header: {
            class: Header as any,
            inlineToolbar: true,
            tunes: ['alignmentTune'],
          },
          list: {
            class: List,
            inlineToolbar: true,
            tunes: ['alignmentTune'],
          },
          paragraph: {
            inlineToolbar: true,
            tunes: ['alignmentTune'],
          },
          underline: Underline,
          quote: {
            class: Quote,
            inlineToolbar: true,
            tunes: ['alignmentTune'],
          },
          color: {
            class: ColorPlugin,
            config: {
              config: {
                colorCollections: ['#013F62', '#FFF1B5', '#FF0000', '#000000'],
                defaultColor: '#013F62',
                type: 'text',
              },
            },
          },
          marker: {
            class: ColorPlugin,
            config: { defaultColor: '#FFF1B5', type: 'marker', icon: '<svg>...</svg>' },
          },
          table: {
            class: Table as any,
            inlineToolbar: true,
          },
          delimiter: Delimiter,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file: File): Promise<{ success: number; file: { url: string } }> {
                  return uploadImagen(file)
                    .then(url => ({ success: 1, file: { url } }))
                    .catch(() => ({ success: 0, file: { url: '' } }));
                },
                uploadByUrl: (url: string) => Promise.resolve({ success: 1, file: { url } }),
              },
            },
          },
        },
        onChange: async () => {
          setTimeout(async () => {
            try {
              const data = await ejInstance.current?.save();
              if (data) onDataChange(data);
            } catch (e) { console.error('Error saving', e); }
          }, 150);
        },
      });
      ejInstance.current = editor;
    }

    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === 'function') {
        ejInstance.current.isReady
          .then(() => { ejInstance.current?.destroy(); ejInstance.current = null; })
          .catch(console.error);
      }
    };
  }, []);

  // ── Resizer ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const leftSide  = document.querySelector('.editor-panel') as HTMLElement;
    const rightSide = document.querySelector('.inline-preview') as HTMLElement;
    const resizer   = document.getElementById('dragMe');

    if (!isShowingPreview) {
      if (leftSide) { leftSide.style.removeProperty('flex'); leftSide.style.removeProperty('width'); }
      return;
    }
    if (!resizer || !leftSide || !rightSide) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const startX          = e.clientX;
      const startWidthRight = rightSide.getBoundingClientRect().width;
      const containerWidth  = window.innerWidth;
      leftSide.style.transition  = 'none';
      rightSide.style.transition = 'none';

      const onMouseMove = (ev: MouseEvent) => {
        const newPct = ((startWidthRight - (ev.clientX - startX)) / containerWidth) * 100;
        if (newPct >= 15 && newPct <= 45) {
          rightSide.style.width = `${newPct}%`;
          leftSide.style.flex   = `0 0 ${100 - newPct}%`;
        }
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.removeProperty('cursor');
        leftSide.style.transition  = 'flex 0.4s ease';
        rightSide.style.transition = 'width 0.4s ease';
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'col-resize';
    };

    resizer.addEventListener('mousedown', onMouseDown);
    return () => resizer.removeEventListener('mousedown', onMouseDown);
  }, [isShowingPreview]);

  // ── Detectar alineación al cambiar bloque/selección ─────────────────────────

  useEffect(() => {
    document.addEventListener('selectionchange', detectAlign);
    return () => document.removeEventListener('selectionchange', detectAlign);
  }, [detectAlign]);

  // ── Handlers de formato ─────────────────────────────────────────────────────

  const handleClearAll = useCallback(() => {
    if (window.confirm('¿Borrar todo el contenido del editor?'))
      ejInstance.current?.blocks.clear();
  }, []);

  const handleUndo = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    let el: Node | null = node;
    while (el) {
      if (el instanceof HTMLElement && el.contentEditable === 'true') {
        el.focus();
        document.execCommand('undo');
        return;
      }
      el = el.parentNode;
    }
  }, []);

  const handleRedo = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    let el: Node | null = node;
    while (el) {
      if (el instanceof HTMLElement && el.contentEditable === 'true') {
        el.focus();
        document.execCommand('redo');
        return;
      }
      el = el.parentNode;
    }
  }, []);

  const handleBold      = useCallback(() => applyCommand('bold'), [applyCommand]);
  const handleItalic    = useCallback(() => applyCommand('italic'), [applyCommand]);
  const handleUnderline = useCallback(() => applyCommand('underline'), [applyCommand]);
  const handleStrike    = useCallback(() => applyCommand('strikeThrough'), [applyCommand]);

  const handleForeColor   = useCallback((color: string) => applyCommand('foreColor', color), [applyCommand]);
  const handleHiliteColor = useCallback((color: string) => applyCommand('hiliteColor', color), [applyCommand]);

  const handleFontFamily = useCallback((family: string) => {
    wrapSelectionWithSpan('fontFamily', family);
  }, [wrapSelectionWithSpan]);

  const handleFontSize = useCallback((px: number) => {
    const clamped = Math.max(8, Math.min(96, px));
    setFontSize(clamped);
    wrapSelectionWithSpan('fontSize', `${clamped}px`);
  }, [wrapSelectionWithSpan]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="editor-layout">

      {/* ── RIBBON TOOLBAR ── */}
      <div className="ribbon-toolbar">

        {/* GRUPO: Archivo */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Archivo</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn btn-delete" onClick={handleClearAll} title="Borrar todo el contenido">
              <Trash2 size={15} />
            </button>
            <button
              className={`ribbon-btn ribbon-btn-save ${
                saveStatus === 'error'
                  ? 'btn-save-error'
                  : saveStatus === 'guardado' || saveStatus === 'publicado'
                    ? 'btn-save-ok'
                    : ''
              }`}
              onClick={onSave}
              disabled={isBusy}
              title="Guardar borrador (Ctrl+S)"
            >
              <SaveIcon status={saveStatus} />
              <span className="ribbon-save-label">{saveLabel(saveStatus)}</span>
            </button>
            <div className="ribbon-separator" />
            <div className="ribbon-category-wrap">
              <span className="ribbon-category-label">Categoría:</span>
              <select
                className="ribbon-select ribbon-select-category"
                value={categoriaId ?? ''}
                onChange={e => onCategoriaChange(Number(e.target.value))}
                title="Categoría de la noticia"
              >
                {categorias.length === 0 && <option value="">Cargando…</option>}
                {categorias.map(c => (
                  <option key={c.id_categoria_noticia} value={c.id_categoria_noticia}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* GRUPO: Historial */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Historial</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn" title="Deshacer (Ctrl+Z)"
              onMouseDown={e => { e.preventDefault(); handleUndo(); }}>
              <Undo2 size={15} />
            </button>
            <button className="ribbon-btn" title="Rehacer (Ctrl+Y)"
              onMouseDown={e => { e.preventDefault(); handleRedo(); }}>
              <Redo2 size={15} />
            </button>
          </div>
        </div>

        {/* GRUPO: Fuente */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Fuente</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn bold" title="Negrita (Ctrl+B)"
              onMouseDown={e => { e.preventDefault(); handleBold(); }}>
              <Bold size={15} />
            </button>
            <button className="ribbon-btn italic" title="Cursiva (Ctrl+I)"
              onMouseDown={e => { e.preventDefault(); handleItalic(); }}>
              <Italic size={15} />
            </button>
            <button className="ribbon-btn underline" title="Subrayado (Ctrl+U)"
              onMouseDown={e => { e.preventDefault(); handleUnderline(); }}>
              <UnderlineIcon size={15} />
            </button>
            <button className="ribbon-btn strike" title="Tachado"
              onMouseDown={e => { e.preventDefault(); handleStrike(); }}>
              <Strikethrough size={15} />
            </button>
          </div>
        </div>

        {/* GRUPO: Alineación */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Alineación</span>
          <div className="ribbon-buttons">
            {(
              [
                { align: 'left',    icon: <AlignLeft size={15} />,    title: 'Izquierda' },
                { align: 'center',  icon: <AlignCenter size={15} />,  title: 'Centrado' },
                { align: 'right',   icon: <AlignRight size={15} />,   title: 'Derecha' },
                { align: 'justify', icon: <AlignJustify size={15} />, title: 'Justificado' },
              ] as const
            ).map(({ align, icon, title }) => (
              <button
                key={align}
                className={`ribbon-btn ${activeAlign === align ? 'active' : ''}`}
                title={title}
                onMouseDown={e => { e.preventDefault(); applyAlign(align); }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* GRUPO: Color */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Color / Resaltado</span>
          <div className="ribbon-buttons">
            <div className="ribbon-color-wrap" title="Color de texto — selecciona texto primero">
              <span className="ribbon-color-label">A</span>
              <input type="color" className="ribbon-color-input" defaultValue="#000000"
                onInput={e => handleForeColor((e.target as HTMLInputElement).value)} />
            </div>
            <div className="ribbon-color-wrap" title="Resaltado — selecciona texto primero">
              <span className="ribbon-color-label ribbon-color-label--hl">A</span>
              <input type="color" className="ribbon-color-input" defaultValue="#FFF1B5"
                onInput={e => handleHiliteColor((e.target as HTMLInputElement).value)} />
            </div>
          </div>
        </div>

        {/* GRUPO: Tipografía */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Tipografía</span>
          <div className="ribbon-buttons">
            <select
              className="ribbon-select"
              defaultValue="Arial"
              onChange={e => handleFontFamily(e.target.value)}
              title="Selecciona texto primero"
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Trebuchet MS">Trebuchet</option>
            </select>
          </div>
        </div>

        {/* GRUPO: Tamaño — solo select, sin botones +/- */}
        <div className="ribbon-group">
          <span className="ribbon-group-label">Tamaño</span>
          <div className="ribbon-buttons">
            <select
              className="ribbon-select ribbon-select-size"
              value={fontSize}
              onChange={e => {
                const v = Number(e.target.value);
                setFontSize(v);
                handleFontSize(v);
              }}
              title="Tamaño de fuente — selecciona texto primero"
            >
              {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GRUPO: Ayuda */}
        <div className="ribbon-group" style={{ borderRight: 'none' }}>
          <span className="ribbon-group-label">Ayuda</span>
          <div className="ribbon-buttons">
            <button className="ribbon-btn" title="¿Cómo usar el editor?" onClick={() => setShowHelp(true)}>
              <HelpCircle size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* ── WORKSPACE ── */}
      <div className="workspace">
        <div className={`editor-panel ${isShowingPreview ? 'with-preview' : 'full-width'}`}>
          <div className="paper-container">
            <div className="editor-content-area">
              <div ref={editorRef} />
            </div>
            <div style={{ height: '50px' }} />
          </div>
        </div>

        {isShowingPreview && (
          <>
            <div className="resizer" id="dragMe" />
            <aside className="inline-preview">
              <div className="inline-preview-content">
                <span className="preview-badge">VISTA RÁPIDA</span>
                <PreviewNoticia data={newsData} />
              </div>
            </aside>
          </>
        )}
      </div>

      <ModalAyuda isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default EditorNoticias;