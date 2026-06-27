import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Shield,
  ShieldCheck,
  ShieldOff,
  User,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { Layout } from "@components/layout";
import { Alert, Button, Card, Modal } from "@components/common";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { authService } from "@/features/auth/services/authService";
import { twoFactorService } from "@/features/auth/services/twoFactorService";
import { UserRole } from "@types";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  DELEGADO: "Delegado",
  JUGADOR: "Jugador",
  ENTRENADOR: "Entrenador",
  ESTUDIANTE: "Estudiante",
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const email = usuario?.email ?? "";
  // En modo vista previa no hay sesion real, asi que el 2FA no aplica.
  const isPreview = authService.isPreview();

  const [dosFaActivo, setDosFaActivo] = React.useState(false);
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isWorking, setIsWorking] = React.useState(false);
  const [twoFaError, setTwoFaError] = React.useState<string | null>(null);
  const [twoFaMessage, setTwoFaMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!email || isPreview) return;
    twoFactorService
      .status(email)
      .then(setDosFaActivo)
      .catch(() => setDosFaActivo(false));
  }, [email, isPreview]);

  // Inicia el alta: genera el secreto y muestra el QR para escanear.
  const handleGenerar = async () => {
    setTwoFaError(null);
    setTwoFaMessage(null);
    setIsWorking(true);
    try {
      const qr = await twoFactorService.generar();
      setQrCode(qr);
      setIsModalOpen(true);
    } catch (error: any) {
      setTwoFaError(
        error.response?.data?.message ?? "No se pudo generar el codigo QR.",
      );
    } finally {
      setIsWorking(false);
    }
  };

  // Confirma la activacion tras escanear el QR.
  const handleActivar = async () => {
    setTwoFaError(null);
    setIsWorking(true);
    try {
      const activo = await twoFactorService.activar(email, true);
      setDosFaActivo(activo);
      setIsModalOpen(false);
      setQrCode(null);
      setTwoFaMessage("Doble autenticacion activada.");
    } catch (error: any) {
      setTwoFaError(
        error.response?.data?.message ?? "No se pudo activar la doble autenticacion.",
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleDesactivar = async () => {
    setTwoFaError(null);
    setTwoFaMessage(null);
    setIsWorking(true);
    try {
      const activo = await twoFactorService.activar(email, false);
      setDosFaActivo(activo);
      setTwoFaMessage("Doble autenticacion desactivada.");
    } catch (error: any) {
      setTwoFaError(
        error.response?.data?.message ?? "No se pudo desactivar la doble autenticacion.",
      );
    } finally {
      setIsWorking(false);
    }
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
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                usuario?.roles.includes(UserRole.DELEGADO) &&
                  !usuario.roles.includes(UserRole.ADMIN)
                  ? "/equipos"
                  : "/panel-admin",
              )
            }
          >
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
              <div className="mt-6 w-full">
                <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold">
                  {dosFaActivo ? (
                    <span className="inline-flex items-center gap-1.5 text-green-600">
                      <ShieldCheck size={16} />
                      Doble autenticación activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-gray-500">
                      <ShieldOff size={16} />
                      Doble autenticación inactiva
                    </span>
                  )}
                </div>

                {twoFaError && (
                  <div className="mb-3">
                    <Alert
                      type="error"
                      message={twoFaError}
                      onClose={() => setTwoFaError(null)}
                    />
                  </div>
                )}
                {twoFaMessage && (
                  <div className="mb-3">
                    <Alert
                      type="success"
                      message={twoFaMessage}
                      onClose={() => setTwoFaMessage(null)}
                    />
                  </div>
                )}

                {isPreview ? (
                  <p className="text-center text-sm text-gray-500">
                    Inicia sesión para gestionar la doble autenticación.
                  </p>
                ) : dosFaActivo ? (
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    disabled={isWorking}
                    onClick={handleDesactivar}
                  >
                    <ShieldOff size={18} />
                    {isWorking ? "Procesando..." : "Desactivar doble autenticación"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    disabled={isWorking}
                    onClick={handleGenerar}
                  >
                    <ShieldCheck size={18} />
                    {isWorking ? "Generando..." : "Activar doble autenticación"}
                  </Button>
                )}
              </div>
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
                  <h2 className="text-xl font-bold text-gray-900">Página web</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Regresa al portal principal de Gestión Deportiva.
                  </p>
                </div>
                <a
                  href="https://test.62344037.xyz/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-600 bg-primary-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
                >
                  <Globe size={18} />
                  Volver a página web
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setQrCode(null);
        }}
        title="Activar doble autenticación"
        size="md"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Escanea este código con Google Authenticator (o una app similar) y
            luego confirma la activación.
          </p>
          {qrCode ? (
            <img
              src={qrCode}
              alt="Código QR de doble autenticación"
              className="mx-auto h-52 w-52 rounded-lg border border-gray-200"
            />
          ) : (
            <p className="text-sm text-gray-500">Generando código...</p>
          )}
          {twoFaError && <Alert type="error" message={twoFaError} closable={false} />}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setQrCode(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isWorking || !qrCode}
              onClick={handleActivar}
            >
              {isWorking ? "Activando..." : "Confirmar activación"}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ProfilePage;
