import React from 'react';
import { X, MousePointer, Type, AlignLeft, Palette, Image, Lightbulb, Info } from 'lucide-react';
import './CSS/ModalAyuda.css';

interface ModalAyudaProps {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    icon: <MousePointer size={16} />,
    title: 'Cómo empezar',
    items: [
      'Haz clic en el área blanca (la hoja) para empezar a escribir.',
      'Presiona el botón  +  que aparece a la izquierda de cada línea para insertar un bloque nuevo (título, lista, imagen, tabla, etc.).',
      'Arrastra los bloques con el ícono ⠿ para reordenarlos.',
    ],
  },
  {
    icon: <Type size={16} />,
    title: 'Formato de texto',
    items: [
      'Selecciona el texto que quieras modificar ANTES de usar los botones de la barra (negrita, cursiva, subrayado, tachado).',
      'Para cambiar el tamaño de fuente: selecciona el texto, luego usa los botones − y + o escribe el número directamente.',
      'Para cambiar la fuente: selecciona el texto, luego elige la familia en el selector "Formato y Fuente".',
    ],
  },
  {
    icon: <Palette size={16} />,
    title: 'Color de texto y resaltado',
    highlight: true,
    items: [
      'Selecciona el texto que quieras colorear.',
      'Haz clic en el cuadro de color (primer cuadro = color de letra, segundo = resaltado) y elige el color en el selector.',
      'Para que el color se aplique: haz clic fuera del selector de color (en cualquier otra parte de la pantalla). El cambio se aplica al cerrar el picker, no al instante.',
      'Si el texto no cambió de color, vuelve a seleccionarlo y repite el proceso.',
    ],
  },
  {
    icon: <AlignLeft size={16} />,
    title: 'Alineación',
    items: [
      'Haz clic dentro del bloque de texto que quieras alinear (no necesitas seleccionar todo el texto).',
      'Luego usa los botones de alineación: izquierda, centro, derecha o justificado.',
    ],
  },
  {
    icon: <Image size={16} />,
    title: 'Imágenes',
    items: [
      'Presiona el botón + y selecciona "Imagen".',
      'Puedes subir una imagen desde tu computadora (máximo 5MB) o pegar una URL directamente.',
      'Las imágenes se guardan en formato Base64 dentro del JSON exportado.',
    ],
  },
  {
    icon: <Lightbulb size={16} />,
    title: 'Consejos rápidos',
    items: [
      'Usa "VISTA PREVIA" (botón arriba a la derecha) para ver cómo quedará la noticia publicada.',
      'Puedes arrastrar el separador entre el editor y la vista previa para ajustar el tamaño de cada panel.',
      'El botón 🗑️ borra todo el contenido del editor (pedirá confirmación).',
      'Usa "PUBLICAR" para exportar la noticia como archivo JSON.',
    ],
  },
];

const ModalAyuda: React.FC<ModalAyudaProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="ayuda-overlay" onClick={onClose}>
      <div className="ayuda-modal" onClick={(e) => e.stopPropagation()}>

        <div className="ayuda-header">
          <div className="ayuda-header-left">
            <Info size={18} />
            <span>Guía de uso del editor</span>
          </div>
          <button className="ayuda-close" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="ayuda-body">
          {sections.map((section, i) => (
            <div key={i} className={`ayuda-section ${section.highlight ? 'ayuda-section--highlight' : ''}`}>
              <div className="ayuda-section-title">
                {section.icon}
                <span>{section.title}</span>
              </div>
              <ul className="ayuda-list">
                {section.items.map((item, j) => (
                  <li key={j} className={item.startsWith('⚠️') ? 'ayuda-warning' : ''}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="ayuda-footer">
          <button className="ayuda-btn-ok" onClick={onClose}>
            ¡Entendido!
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalAyuda;