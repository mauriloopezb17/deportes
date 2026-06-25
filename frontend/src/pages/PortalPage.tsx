import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, LogIn, Trophy, UsersRound } from "lucide-react";
import logoSrc from "../components/images/Logo color - azul (1).png";

const PortalPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-gray-950">
      <section className="min-h-screen bg-[var(--color-navy)] text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Gestion Deportiva"
                className="h-14 w-14 rounded-lg bg-white object-contain p-1"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-accent-500">
                  UCB
                </p>
                <h1 className="text-lg font-bold">Gestion Deportiva</h1>
              </div>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-gray-950 shadow-sm transition hover:bg-accent-600"
            >
              <LogIn size={18} />
              Iniciar sesion
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wide text-accent-500">
                Portal web deportivo
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
                Administracion de torneos, equipos y resultados deportivos
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-primary-100">
                Consulta la actividad deportiva institucional y accede al panel
                de gestion con tu cuenta asignada.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-3 text-base font-bold text-gray-950 shadow-sm transition hover:bg-accent-600"
                >
                  <LogIn size={20} />
                  Iniciar sesion
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <InfoItem
                icon={<Trophy size={24} />}
                title="Torneos"
                text="Seguimiento de competencias y disciplinas."
              />
              <InfoItem
                icon={<UsersRound size={24} />}
                title="Equipos"
                text="Registro de delegados, entrenadores y jugadores."
              />
              <InfoItem
                icon={<CalendarDays size={24} />}
                title="Fixture"
                text="Programacion de partidos y resultados."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, title, text }) => (
  <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500 text-gray-950">
      {icon}
    </div>
    <h3 className="mt-4 text-lg font-bold">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-primary-100">{text}</p>
  </div>
);

export default PortalPage;
