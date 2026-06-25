import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  ClipboardList,
  Settings,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { UserRole } from "@types";
import logoSrc from "../../../components/images/Logo color - azul (1).png";

const previewLinks = [
  {
    label: "Panel principal",
    path: "/panel-admin",
    icon: BarChart3,
    roles: [UserRole.ADMIN],
  },
  {
    label: "Panel delegado",
    path: "/panel-delegado",
    icon: BarChart3,
    roles: [UserRole.DELEGADO],
  },
  {
    label: "Panel entrenador",
    path: "/panel-entrenador",
    icon: ClipboardList,
    roles: [UserRole.ENTRENADOR],
  },
  {
    label: "Equipos",
    path: "/equipos",
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.DELEGADO],
  },
  {
    label: "Jugadores",
    path: "/jugadores",
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.DELEGADO],
  },
  {
    label: "Reservas",
    path: "/reservas",
    icon: Calendar,
    roles: [UserRole.ADMIN, UserRole.DELEGADO],
  },
  {
    label: "Torneos",
    path: "/torneos",
    icon: Trophy,
    roles: [UserRole.ADMIN, UserRole.DELEGADO],
  },
  {
    label: "Fixture",
    path: "/fixture",
    icon: CalendarDays,
    roles: [UserRole.ADMIN, UserRole.DELEGADO],
  },
  {
    label: "Resultados",
    path: "/resultados",
    icon: BarChart3,
    roles: [UserRole.ADMIN, UserRole.DELEGADO],
  },
  {
    label: "Administracion",
    path: "/admin",
    icon: UserCog,
    roles: [UserRole.ADMIN],
  },
  {
    label: "Configuracion",
    path: "/settings",
    icon: Settings,
    roles: [UserRole.ADMIN],
  },
];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { enterPreview } = useAuthStore();

  const openPreview = (path: string, roles: UserRole[]) => {
    enterPreview(roles);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
        <div className="w-full overflow-hidden rounded-lg border border-primary-100 bg-white shadow-xl">
          <div className="h-3 bg-[linear-gradient(90deg,var(--color-navy)_0%,var(--color-navy)_34%,var(--color-cyan)_34%,var(--color-cyan)_68%,var(--color-yellow)_68%,var(--color-yellow)_100%)]" />
          <div className="p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 rounded-lg bg-[var(--color-navy)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Gestion Deportiva"
                className="h-14 w-14 rounded-lg bg-white object-contain p-1"
              />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent-500">
                  Acceso temporal
                </p>
                <h1 className="text-2xl font-bold text-white">
                  Gestion Deportiva
                </h1>
              </div>
            </div>
            <span className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-gray-950">
              Pendiente de login externo
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-950">
              Elegi una vista para revisar
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              Estos botones son temporales para navegar las pantallas mientras
              se vincula el login externo del proyecto.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previewLinks.map((item, index) => {
              const Icon = item.icon;
              const tone =
                index % 3 === 0
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : index % 3 === 1
                    ? "border-accent-500 bg-accent-50 text-gray-950"
                    : "border-gray-200 bg-white text-gray-950";
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => openPreview(item.path, item.roles)}
                  className={`flex min-h-20 items-center gap-3 rounded-lg border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${tone}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-navy)] text-white">
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block font-bold text-gray-950">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      Vista con rol {item.roles[0]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
