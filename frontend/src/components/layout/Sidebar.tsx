import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { UserRole } from "@types";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  ClipboardList,
  Home,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { hasRole } = useAuthStore();
  const isDelegateOnly = hasRole(UserRole.DELEGADO) && !hasRole(UserRole.ADMIN);
  const homeHref = hasRole(UserRole.ADMIN)
    ? "/panel-admin"
    : hasRole(UserRole.DELEGADO)
      ? "/panel-delegado"
      : hasRole(UserRole.ENTRENADOR)
        ? "/panel-entrenador"
        : "/dashboard";

  const menuItems = [
    {
      icon: Home,
      label: "Inicio",
      href: homeHref,
      roles: [
        UserRole.ADMIN,
        UserRole.DELEGADO,
        UserRole.ENTRENADOR,
        UserRole.JUGADOR,
      ],
    },
    {
      icon: UserPlus,
      label: "Anadir usuario",
      href: "/admin",
      roles: [UserRole.ADMIN],
    },
    {
      icon: ClipboardList,
      label: "Panel Entrenador",
      href: "/panel-entrenador",
      roles: [UserRole.ENTRENADOR],
    },
    {
      icon: Users,
      label: "Equipos",
      href: "/equipos",
      roles: [UserRole.ADMIN, UserRole.DELEGADO],
    },
    {
      icon: Users,
      label: "Jugadores",
      href: "/jugadores",
      roles: [UserRole.ADMIN, UserRole.DELEGADO],
    },
    {
      icon: Calendar,
      label: "Reservas de Canchas",
      href: "/reservas",
      roles: [UserRole.ADMIN, UserRole.DELEGADO],
    },
    {
      icon: Trophy,
      label: "Torneos",
      href: "/torneos",
      roles: [UserRole.ADMIN, UserRole.DELEGADO],
    },
    {
      icon: CalendarDays,
      label: "Fixture",
      href: "/fixture",
      roles: [UserRole.ADMIN, UserRole.DELEGADO],
    },
    {
      icon: BarChart3,
      label: "Resultados",
      href: "/resultados",
      roles: [UserRole.ADMIN, UserRole.DELEGADO],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (isDelegateOnly) {
      return ["/equipos", "/jugadores", "/resultados"].includes(item.href);
    }

    return hasRole(item.roles);
  });
  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 transform border-r border-primary-600 bg-[var(--color-navy)] text-white shadow-xl transition-transform
          z-40 lg:relative lg:top-0 lg:h-screen lg:transform-none
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-4 lg:hidden flex justify-end">
          <button onClick={onClose} className="rounded-lg p-2 text-white hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        <div className="mx-4 mt-4 rounded-lg border border-white/20 bg-primary-600 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-white">
            Gestión deportiva
          </p>
          <p className="mt-1 text-sm text-white/85">
            Torneos, reservas y equipos en un solo lugar.
          </p>
          <div className="mt-3 h-1.5 w-24 rounded-full bg-accent-500" />
        </div>

        <nav className="p-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                  ${
                    active
                      ? "bg-accent-500 text-gray-950 shadow-sm"
                      : "text-white/80 hover:bg-primary-600 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

