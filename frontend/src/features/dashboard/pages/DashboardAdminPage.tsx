import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import StatCard from "../../../shared/components/StatCard";
import { ExportarReporteButton } from "../../../shared/components/ExportarReporteButton";
import { listarDisciplinas } from "../../disciplinas/services/disciplinaService";
import { getReservas } from "../../reservas/services/reservaService";
import "./DashboardAdminPage.css";

type Stats = {
  reservasRegistradas: number;
  reservasActivas: number;
  reservasCanceladas: number;
  disciplinasActivas: number;
};

function DashboardAdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    reservasRegistradas: 0,
    reservasActivas: 0,
    reservasCanceladas: 0,
    disciplinasActivas: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      setCargando(true);
      try {
        const [reservas, disciplinas] = await Promise.all([
          getReservas(),
          listarDisciplinas(),
        ]);

        setStats({
          reservasRegistradas: reservas.length,
          reservasActivas: reservas.filter((reserva) => reserva.estado !== "cancelada").length,
          reservasCanceladas: reservas.filter((reserva) => reserva.estado === "cancelada").length,
          disciplinasActivas: disciplinas.filter((disciplina) => disciplina.estado === "activa").length,
        });
      } catch (e) {
        console.error("Error cargando stats del dashboard", e);
      } finally {
        setCargando(false);
      }
    };

    void cargarStats();
  }, []);

  const quickAccess: { label: string; helper: string; path: string }[] = [
    {
      label: "Calendario admin",
      helper: "Gestión semanal de espacios",
      path: "/calendario",
    },
    {
      label: "Calendario consulta",
      helper: "Vista pública sin edición",
      path: "/calendario/consulta",
    },
    {
      label: "Reservas",
      helper: "Administrar solicitudes y comprobantes",
      path: "/reservas",
    },
    {
      label: "Disciplinas",
      helper: "Crear, editar y activar disciplinas",
      path: "/disciplinas",
    },
  ];

  return (
    <div className="page-stack dashboard-lms">
      <PageHeader
        eyebrow="Panel administrativo"
        title="Departamento de Deportes"
        description="Gestión del calendario semanal, reservas y disciplinas deportivas."
      />

      <section className="stats-grid">
        <StatCard
          label="Reservas registradas"
          value={cargando ? "..." : stats.reservasRegistradas}
          helper="en el sistema"
        />
        <StatCard
          label="Reservas activas"
          value={cargando ? "..." : stats.reservasActivas}
          tone="green"
          helper="confirmadas o pendientes"
        />
        <StatCard
          label="Reservas canceladas"
          value={cargando ? "..." : stats.reservasCanceladas}
          tone="yellow"
          helper="historial"
        />
        <StatCard
          label="Disciplinas activas"
          value={cargando ? "..." : stats.disciplinasActivas}
          tone="green"
          helper="disciplinas"
        />
      </section>

      <section className="panel-card dashboard-report-card">
        <div className="section-heading">
          <span>Módulo de reportes</span>
          <h2>Exportar información de tus módulos</h2>
        </div>

        <div className="dashboard-report-grid">
          <div className="dashboard-report-item">
            <span>MÓDULO RESERVAS</span>
            <ExportarReporteButton
              endpoint="/reservas/reporte"
              filtrosActuales={{ desde: "", hasta: "", estado: "todos" }}
              nombreArchivoBase="Reporte_General_Reservas_Espacios"
              filtrosConfig={[
                { name: "desde", label: "Fecha inicio", type: "date" },
                { name: "hasta", label: "Fecha fin", type: "date" },
                {
                  name: "estado",
                  label: "Estado",
                  type: "select",
                  options: [
                    { value: "todos", label: "Todos" },
                    { value: "confirmada", label: "Confirmada" },
                    { value: "cancelada", label: "Cancelada" },
                  ],
                },
              ]}
            />
          </div>

          <div className="dashboard-report-item">
            <span>MÓDULO DISCIPLINAS</span>
            <ExportarReporteButton
              endpoint="/disciplinas/reporte"
              filtrosActuales={{ estado: "todas" }}
              nombreArchivoBase="Reporte_General_Disciplinas_Deportivas"
              filtrosConfig={[
                {
                  name: "estado",
                  label: "Estado",
                  type: "select",
                  options: [
                    { value: "todas", label: "Todas" },
                    { value: "activas", label: "Activas" },
                    { value: "inactivas", label: "Inactivas" },
                  ],
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <span>Accesos rápidos</span>
          <h2>Ir directamente a una pantalla</h2>
        </div>

        <div className="quick-grid">
          {quickAccess.map((item) => (
            <button
              key={item.label}
              className="quick-card"
              onClick={() => navigate(item.path)}
            >
              <strong>{item.label}</strong>
              <span>{item.helper}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardAdminPage;
