import React from 'react';
import './CSS/PreviewNoticia.css';

interface PreviewProps {
  data: any;
}

// ── Helper: extrae la alineación del tune (si existe) ──────────────────────
function getAlignment(block: any): React.CSSProperties {
  const alignment = block?.tunes?.alignmentTune?.alignment;
  return alignment ? { textAlign: alignment as React.CSSProperties['textAlign'] } : {};
}

// ── Componente ─────────────────────────────────────────────────────────────
const PreviewNoticia = ({ data }: PreviewProps) => {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return (
      <p className="preview-empty">
        Escriba algo en el editor para ver la vista previa...
      </p>
    );
  }

  return (
    <div className="preview-real-content">
      {data.blocks.map((block: any, index: number) => {
        const alignStyle = getAlignment(block);

        switch (block.type) {

          case 'header': {
            const Tag = `h${block.data.level}` as any;
            return (
              <Tag
                key={index}
                className="preview-header"
                style={alignStyle}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );
          }

          case 'paragraph':
            return (
              <p
                key={index}
                className="preview-text"
                style={alignStyle}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );

          case 'quote':
            return (
              <blockquote key={index} className="preview-quote" style={alignStyle}>
                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                {block.data.caption && <cite>— {block.data.caption}</cite>}
              </blockquote>
            );

          case 'list': {
            const LTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <LTag key={index} className="preview-list" style={alignStyle}>
                {block.data.items.map((item: any, i: number) => {
                  const content =
                    typeof item === 'object' ? (item.content || item.text) : item;
                  return (
                    <li key={i}>
                      <span dangerouslySetInnerHTML={{ __html: content }} />
                      {item.items && item.items.length > 0 && (
                        <PreviewNoticia
                          data={{
                            blocks: [{
                              type: 'list',
                              data: { style: block.data.style, items: item.items },
                            }],
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </LTag>
            );
          }

          case 'checklist':
            return (
              <div key={index} className="preview-checklist" style={alignStyle}>
                {block.data.items.map((item: any, i: number) => (
                  <div key={i} className="preview-checklist-item">
                    <div className="preview-checklist-icon">
                      <i
                        className={item.checked ? 'fas fa-check-square' : 'far fa-square'}
                        style={{ color: item.checked ? '#002b5c' : '#ccc' }}
                      />
                    </div>
                    <span
                      className="preview-text"
                      style={{
                        textDecoration: item.checked ? 'line-through' : 'none',
                        color: item.checked ? '#888' : '#333',
                        marginBottom: 0,
                      }}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  </div>
                ))}
              </div>
            );

          case 'image':
            return (
              <figure key={index} className="preview-figure" style={alignStyle}>
                <img src={block.data.file?.url} alt={block.data.caption || 'Imagen'} />
                {block.data.caption && (
                  <figcaption>{block.data.caption}</figcaption>
                )}
              </figure>
            );

          case 'table':
            return (
              <div
                key={index}
                className="preview-table-container"
                style={{ overflowX: 'auto', ...alignStyle }}
              >
                <table>
                  <tbody>
                    {block.data.content.map((row: string[], i: number) => (
                      <tr key={i}>
                        {row.map((cell: string, j: number) => (
                          <td
                            key={j}
                            dangerouslySetInnerHTML={{ __html: cell }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'delimiter':
            return (
              <hr
                key={index}
                style={{ margin: '20px 0', border: '0', borderTop: '2px solid #eee' }}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default PreviewNoticia;