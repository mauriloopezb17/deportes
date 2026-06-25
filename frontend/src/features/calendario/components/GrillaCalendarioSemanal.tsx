import { type CSSProperties, useEffect, useMemo, useState } from "react";
import Spinner from "../../../shared/components/Spinner";
import {
  DIAS_SEMANA,
  fechaParaAPI,
  getDisponibilidad,
  getEspacios,
} from "../../reservas/services/reservaService";
import type {
  BloqueOcupado,
  Espacio,
} from "../../reservas/types/reserva.types";

type Props = {
  semanaBase: Date;
  espacioId?: number;
  onBloqueLibreClick?: (dia: string, hora: string) => void;
  onConflicto?: (mensaje: string) => void;
};

const INICIO_CALENDARIO = "12:00";
const FIN_CALENDARIO = "19:00";
const DURACION_SLOT_MINUTOS = 30;
const ALTO_SLOT_PX = 46;

function horaAMinutos(hora: string) {
  const [h, m] = hora.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function minutosAHora(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generarSlots(inicio: string, fin: string, incluirFin = false) {
  const inicioMin = horaAMinutos(inicio);
  const finMin = horaAMinutos(fin);
  const slots: string[] = [];

  for (
    let actual = inicioMin;
    incluirFin ? actual <= finMin : actual < finMin;
    actual += DURACION_SLOT_MINUTOS
  ) {
    slots.push(minutosAHora(actual));
  }

  return slots;
}

export function clasePorEspacio(nombre: string) {
  return nombre.toLowerCase().includes("arquitect")
    ? "arquitectura"
    : "coliseo";
}

function normalizarHora(hora: string) {
  return hora.slice(0, 5);
}

function sumarDias(fecha: Date, dias: number) {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate() + dias,
  );
}

function esMismoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const HORAS_SLOTS = generarSlots(INICIO_CALENDARIO, FIN_CALENDARIO);
const HORAS_EJE = generarSlots(INICIO_CALENDARIO, FIN_CALENDARIO, true);

const INICIO_GRID_MINUTOS = horaAMinutos(INICIO_CALENDARIO);
const FIN_GRID_MINUTOS = horaAMinutos(FIN_CALENDARIO);
const TOTAL_MINUTOS = FIN_GRID_MINUTOS - INICIO_GRID_MINUTOS;
const ALTO_TOTAL_GRID = (TOTAL_MINUTOS / DURACION_SLOT_MINUTOS) * ALTO_SLOT_PX;

const DIA_ABREV: Record<string, string> = {
  Lunes: "LUN",
  Martes: "MAR",
  Miércoles: "MIÉ",
  Jueves: "JUE",
  Viernes: "VIE",
  Sábado: "SÁB",
};

type BloquePosicionado = {
  bloque: BloqueOcupado;
  top: number;
  height: number;
};

function calcularBloquesPosicionados(
  bloques: BloqueOcupado[],
): BloquePosicionado[] {
  return bloques.flatMap((bloque) => {
    const inicioBloque = Math.max(
      horaAMinutos(bloque.hora_inicio),
      INICIO_GRID_MINUTOS,
    );

    const finBloque = Math.min(
      horaAMinutos(bloque.hora_fin),
      FIN_GRID_MINUTOS,
    );

    if (finBloque <= INICIO_GRID_MINUTOS || inicioBloque >= FIN_GRID_MINUTOS) {
      return [];
    }

    const top =
      ((inicioBloque - INICIO_GRID_MINUTOS) / DURACION_SLOT_MINUTOS) *
      ALTO_SLOT_PX;

    const height =
      ((finBloque - inicioBloque) / DURACION_SLOT_MINUTOS) * ALTO_SLOT_PX;

    return [
      {
        bloque,
        top,
        height: Math.max(height, 34),
      },
    ];
  });
}

function GrillaCalendarioSemanal({
  semanaBase,
  espacioId,
  onBloqueLibreClick,
  onConflicto,
}: Props) {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [bloquesOcupados, setBloquesOcupados] = useState<
    Record<string, BloqueOcupado[]>
  >({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);

      try {
        const espaciosData = await getEspacios();
        setEspacios(espaciosData);

        const nuevosBloques: Record<string, BloqueOcupado[]> = {};

        for (let i = 0; i < DIAS_SEMANA.length; i += 1) {
          const fecha = fechaParaAPI(semanaBase, i);

          for (const espacio of espaciosData) {
            const disponibilidad = await getDisponibilidad(espacio.id, fecha);

            nuevosBloques[`${espacio.id}-${DIAS_SEMANA[i]}`] =
              disponibilidad.bloques_ocupados || [];
          }
        }

        setBloquesOcupados(nuevosBloques);
      } finally {
        setCargando(false);
      }
    };

    void cargarDatos();
  }, [semanaBase]);

  const espaciosMostrados = useMemo(
    () => (espacioId ? espacios.filter((e) => e.id === espacioId) : espacios),
    [espacioId, espacios],
  );

  const obtenerBloquesDeDia = (id: number, dia: string) =>
    bloquesOcupados[`${id}-${dia}`] || [];

  const gridStyle = {
    "--gc-slot-height": `${ALTO_SLOT_PX}px`,
    "--gc-body-height": `${ALTO_TOTAL_GRID}px`,
  } as CSSProperties;

  return (
    <section className="gc-container">
      {cargando && <Spinner texto="Cargando disponibilidad..." />}

      {espaciosMostrados.map((espacio) => {
        const espacioClase = clasePorEspacio(espacio.nombre);

        return (
          <div key={espacio.id} className="gc-wrapper">
            <div className="gc-scroll">
              <div className="gc-calendar" style={gridStyle}>
                <div className="gc-header-row">
                  <div className="gc-corner" />

                  {DIAS_SEMANA.map((dia, colIdx) => {
                    const fecha = sumarDias(semanaBase, colIdx);
                    const hoy = esMismoDia(fecha, new Date());

                    return (
                      <div
                        key={dia}
                        className={`gc-day-header${hoy ? " gc-today" : ""}`}
                      >
                        <div className="gc-day-name">
                          {DIA_ABREV[dia] || dia.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="gc-day-number">{fecha.getDate()}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="gc-body-row">
                  <div className="gc-time-axis">
                    {HORAS_EJE.map((hora) => {
                      const top =
                        ((horaAMinutos(hora) - INICIO_GRID_MINUTOS) /
                          DURACION_SLOT_MINUTOS) *
                        ALTO_SLOT_PX;

                      return (
                        <span
                          key={hora}
                          className={`gc-time-label${
                            hora.endsWith(":30") ? " half" : ""
                          }`}
                          style={{ top }}
                        >
                          {hora}
                        </span>
                      );
                    })}
                  </div>

                  <div className="gc-days-area">
                    {DIAS_SEMANA.map((dia) => {
                      const bloques = obtenerBloquesDeDia(espacio.id, dia);
                      const bloquesPosicionados =
                        calcularBloquesPosicionados(bloques);

                      return (
                        <div key={dia} className="gc-day-body">
                          <div className="gc-slots-layer">
                            {HORAS_SLOTS.map((hora) => (
                              <button
                                key={`${espacio.id}-${dia}-${hora}`}
                                className={`gc-slot-cell${
                                  hora.endsWith(":30") ? " half" : ""
                                }`}
                                type="button"
                                onClick={() => onBloqueLibreClick?.(dia, hora)}
                                aria-label={`Bloque libre ${dia} ${hora}`}
                              />
                            ))}
                          </div>

                          <div className="gc-events-layer">
                            {bloquesPosicionados.map(({ bloque, top, height }) => (
                              <button
                                key={`${espacio.id}-${dia}-${bloque.hora_inicio}-${bloque.hora_fin}`}
                                type="button"
                                className={`gc-event-block ${espacioClase}`}
                                style={{
                                  top,
                                  height,
                                }}
                                onClick={() =>
                                  onConflicto?.(
                                    `El horario del ${dia} de ${normalizarHora(
                                      bloque.hora_inicio,
                                    )} a ${normalizarHora(
                                      bloque.hora_fin,
                                    )} ya está ocupado.`,
                                  )
                                }
                              >
                                <span className="gc-event-title">
                                  {bloque.tipo === "clase"
                                    ? "Clase"
                                    : bloque.motivo || "Reserva"}
                                </span>
                                <span className="gc-event-time">
                                  {normalizarHora(bloque.hora_inicio)} –{" "}
                                  {normalizarHora(bloque.hora_fin)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default GrillaCalendarioSemanal;