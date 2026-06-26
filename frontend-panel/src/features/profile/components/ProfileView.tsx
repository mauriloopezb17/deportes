import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Shield, ShieldCheck, User, ArrowLeft, LogOut } from "lucide-react";
import { Layout } from "@components/layout";
import { Button, Card } from "@components/common";
import { useAuthStore } from "@/features/auth/stores/authStore";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  DELEGADO: "Delegado",
  JUGADOR: "Jugador",
  ENTRENADOR: "Entrenador",
  ESTUDIANTE: "Estudiante",
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = "https://test.62344037.xyz/";
  };

  const fullName = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(" ");
  const initials = `${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`
    .toUpperCase()
    .trim();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">
              Información de tu cuenta y permisos dentro del sistema.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/panel-admin")}>
            <ArrowLeft size={18} />
            Volver al inicio
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-bold">
                {initials || <User size={40} />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                {fullName || "Usuario"}
              </h2>
              <p className="text-gray-600 mt-1">{usuario?.email}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {usuario?.roles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold"
                  >
                    {roleLabels[role] ?? role}
                  </span>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                className="mt-6"
              >
                <ShieldCheck size={18} />
                Activar doble autenticación
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Datos de Cuenta
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    <User size={16} />
                    Nombre
                  </div>
                  <p className="text-gray-900 font-semibold mt-2">
                    {usuario?.nombre || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    <User size={16} />
                    Apellido
                  </div>
                  <p className="text-gray-900 font-semibold mt-2">
                    {usuario?.apellido || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    <Mail size={16} />
                    Correo
                  </div>
                  <p className="text-gray-900 font-semibold mt-2">
                    {usuario?.email || "-"}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Roles y Accesos
              </h2>
              <div className="space-y-3">
                {usuario?.roles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                        <Shield size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {roleLabels[role] ?? role}
                        </p>
                        <p className="text-sm text-gray-600">
                          Acceso habilitado para este perfil.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Sesión</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Puedes cerrar sesión desde aquí cuando termines de usar el
                    sistema.
                  </p>
                </div>
                <Button variant="danger" onClick={handleLogout}>
                  <LogOut size={18} />
                  Cerrar sesión
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
