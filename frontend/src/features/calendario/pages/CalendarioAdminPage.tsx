import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../../shared/components/StatCard";
import { formatFechaBO } from "../../../shared/services/apiClient";
import {
  getEspacios,
  getReservas,
  fechaParaAPI,
} from "../../reservas/services/reservaService";
import type { Espacio } from "../../reservas/types/reserva.types";
import AlertasCalendario from "../components/AlertasCalendario";
import EncabezadoCalendario from "../components/EncabezadoCalendario";
import GrillaCalendarioSemanal, {
  clasePorEspacio,
} from "../components/GrillaCalendarioSemanal";
import LeyendaCalendario from "../components/LeyendaCalendario";
import NavegacionSemana from "../components/NavegacionSemana";
import "./CalendarioAdminPage.css";

function obtenerLunes(fecha: Date) {
  const copia = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
  );

  const dia = copia.getDay();
  const ajuste = dia === 0 ? -6 : 1 - dia;

  copia.setDate(copia.getDate() + ajuste);
  return copia;
}

function sumarDias(fecha: Date, dias: number) {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate() + dias,
  );
}

function CalendarioAdminPage() {
  const navigate = useNavigate();

  const [semanaBase, setSemanaBase] = useState(obtenerLunes(new Date()));
  const [mensaje, setMensaje] = useState("");
  const [totalReservas, setTotalReservas] = useState(0);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    getEspacios().then((data) => {
      setEspacios(data);
      setEspacioSeleccionado((actual) => actual ?? data[0]?.id);
    });
  }, []);

  useEffect(() => {
    const fechasSemana = Array.from({ length: 6 }, (_, i) =>
      fechaParaAPI(semanaBase, i),
    );

    Promise.all(fechasSemana.map((fecha) => getReservas({ fecha })))
      .then((resultados) => {
        const total = resultados.reduce(
          (sumatoria, reservasDelDia) => sumatoria + reservasDelDia.length,
          0,
        );

        setTotalReservas(total);
      })
      .catch(() => {
        setTotalReservas(0);
      });
  }, [semanaBase]);

  const etiquetaSemana = useMemo(() => {
    const finSemana = sumarDias(semanaBase, 5);
    return `${formatFechaBO(semanaBase)} - ${formatFechaBO(finSemana)}`;
  }, [semanaBase]);

  return (
    <div className="page-stack calendario-lms">
      <EncabezadoCalendario
        titulo="Calendario Semanal"
        subtitulo="Control semanal de reservas, clases y entrenamientos por espacio deportivo."
        textoBoton="Ver reservas"
        onClickBoton={() => navigate("/reservas")}
      />

      <section className="stats-grid compact">
        <StatCard label="Reservas registradas" value={totalReservas} />
        <StatCard label="Horario visible" value="12:00 - 19:00" />
      </section>

      <div className="gc-toolbar">
        <NavegacionSemana
          etiquetaSemana={etiquetaSemana}
          onSemanaAnterior={() => setSemanaBase((prev) => sumarDias(prev, -7))}
          onSemanaSiguiente={() => setSemanaBase((prev) => sumarDias(prev, 7))}
        />

        <div className="gc-space-picker">
          {espacios.map((espacio) => (
            <button
              key={espacio.id}
              type="button"
              className={`gc-space-chip${
                espacioSeleccionado === espacio.id ? " active" : ""
              }`}
              onClick={() => setEspacioSeleccionado(espacio.id)}
            >
              <span
                className={`gc-space-dot ${clasePorEspacio(espacio.nombre)}`}
              />
              {espacio.nombre}
            </button>
          ))}
        </div>
      </div>

      <LeyendaCalendario espacios={espacios} />

      <AlertasCalendario mensaje={mensaje} tipo="error" />

      {espacioSeleccionado && (
        <GrillaCalendarioSemanal
          semanaBase={semanaBase}
          espacioId={espacioSeleccionado}
          onConflicto={(msg) => setMensaje(msg)}
        />
      )}
    </div>
  );
}

export default CalendarioAdminPage;