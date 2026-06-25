import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { LogOut, Menu, User } from "lucide-react";
import logoSrc from "../images/Logo color - azul (1).png";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const goToProfile = () => {
    setShowDropdown(false);
    navigate("/perfil");
  };

  return (
    <header
      className="sticky top-0 z-40 border-b shadow-sm"
      style={{
        backgroundColor: "var(--color-navy)",
        borderColor: "var(--color-cyan)",
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/15 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Gestion Deportiva"
                className="h-11 w-11 rounded-lg bg-white object-contain p-1"
              />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Gestion Deportiva
                </h1>
                <p className="hidden text-xs font-medium text-white/85 sm:block">
                  Panel universitario
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 rounded-lg border px-3 py-2 shadow-sm transition-colors hover:brightness-105"
              style={{
                backgroundColor: "var(--color-cyan)",
                borderColor: "rgba(255,255,255,0.45)",
              }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: "var(--color-yellow)",
                  color: "var(--color-navy)",
                }}
              >
                <User size={18} />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-white">
                  {usuario?.nombre}
                </span>
                <span className="block text-xs text-white/75">
                  {usuario?.roles?.[0] ?? "Usuario"}
                </span>
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
                <button
                  onClick={goToProfile}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                >
                  <User size={16} />
                  Mi Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
