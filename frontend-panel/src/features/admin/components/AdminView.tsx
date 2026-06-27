import React, { useEffect, useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Layout } from "@components/layout";
import { Alert, Button, Card, Input, Select } from "@components/common";
import {
  CarreraAdmin,
  RolSistema,
  usuarioAdminService,
} from "@/features/admin/services/adminService";
import { authService } from "@/features/auth/services/authService";

const emptyUserForm = {
  nombres: "",
  ape_paterno: "",
  ape_materno: "",
  fecha_nacimiento: "",
  ci: "",
  celular: "",
  email: "",
  id_rol: "",
  id_carrera: "",
  gestion: "",
};

const isRoleDelegado = (nombre?: string) =>
  (nombre ?? "").toLowerCase().includes("delegado");

const isRoleJugador = (nombre?: string) =>
  (nombre ?? "").toLowerCase().includes("jugador");

const AdminPage: React.FC = () => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [roles, setRoles] = useState<RolSistema[]>([]);
  const [carreras, setCarreras] = useState<CarreraAdmin[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [rolesData, carrerasData] = await Promise.all([
          usuarioAdminService.obtenerRoles(),
          usuarioAdminService.obtenerCarreras(),
        ]);
        setRoles(rolesData);
        setCarreras(carrerasData);
      } catch {
        setError("No se pudieron cargar los datos del formulario.");
      }
    };

    void loadOptions();
  }, []);

  // El cuerpo tecnico se registra aqui; los jugadores van por Inscribir Deportista.
  const staffRoles = roles.filter((rol) => !isRoleJugador(rol.nombre_rol));
  const selectedRole = roles.find(
    (rol) => rol.id_rol === Number(userForm.id_rol),
  );
  const isDelegado = isRoleDelegado(selectedRole?.nombre_rol);

  const handleUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // En modo vista previa no hay una sesion real (token = "preview-token"),
    // por lo que el backend rechaza cualquier escritura con 401.
    if (authService.isPreview()) {
      setError(
        "Estas en modo vista previa. Inicia sesion con una cuenta de administrador para registrar usuarios.",
      );
      return;
    }

    if (!userForm.id_rol) {
      setError("Selecciona un rol para el usuario.");
      return;
    }
    if (isDelegado && (!userForm.id_carrera || !userForm.gestion)) {
      setError("Para delegado, selecciona carrera y gestion.");
      return;
    }

    setIsSubmitting(true);
    try {
      await usuarioAdminService.registrarUsuario({
        nombres: userForm.nombres.trim(),
        ape_paterno: userForm.ape_paterno.trim(),
        ape_materno: userForm.ape_materno.trim(),
        fecha_nacimiento: userForm.fecha_nacimiento,
        celular: userForm.celular.trim(),
        ci: userForm.ci.trim(),
        // El endpoint de registro (deportistasService) no acepta complemento:
        // su DTO usa forbidNonWhitelisted y rechaza cualquier campo extra.
        email: userForm.email.trim(),
        id_rol: Number(userForm.id_rol),
        ...(isDelegado && {
          id_carrera: Number(userForm.id_carrera),
          // El backend valida gestion como entero (@IsInt).
          gestion: Number(userForm.gestion),
        }),
      });
      setMessage(
        "Usuario registrado. La contrasena inicial es su numero de CI.",
      );
      setUserForm(emptyUserForm);
    } catch (err: any) {
      const detail =
        err.response?.data?.message ??
        err.message ??
        "Error al registrar el usuario.";
      setError(Array.isArray(detail) ? detail.join(". ") : detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {showUserForm ? (
          <UserForm
            formData={userForm}
            setFormData={setUserForm}
            staffRoles={staffRoles}
            isDelegado={isDelegado}
            isSubmitting={isSubmitting}
            carreras={carreras}
            message={message}
            error={error}
            onSubmit={handleUserSubmit}
            onBack={() => {
              setShowUserForm(false);
              setUserForm(emptyUserForm);
              setMessage(null);
              setError(null);
            }}
            onClearMessage={() => setMessage(null)}
            onClearError={() => setError(null)}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
              <div className="h-1.5 bg-[var(--color-yellow)]" />
              <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
                    Administracion
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-white">
                    Panel Administrativo
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                    Gestiona inscripciones de deportistas externos y permisos de
                    usuarios administrativos.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="primary"
                    className="gap-2"
                    onClick={() => {
                      setShowUserForm(true);
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    <UserPlus size={20} />
                    Anadir usuario
                  </Button>
                </div>
              </div>
            </div>

            {message && (
              <Alert type="success" message={message} onClose={() => setMessage(null)} />
            )}
            {error && (
              <Alert type="warning" message={error} onClose={() => setError(null)} />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

interface UserFormProps {
  formData: typeof emptyUserForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyUserForm>>;
  staffRoles: RolSistema[];
  isDelegado: boolean;
  isSubmitting: boolean;
  carreras: CarreraAdmin[];
  message: string | null;
  error: string | null;
  onSubmit: (event: React.FormEvent) => void;
  onBack: () => void;
  onClearMessage: () => void;
  onClearError: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  setFormData,
  staffRoles,
  isDelegado,
  isSubmitting,
  carreras,
  message,
  error,
  onSubmit,
  onBack,
  onClearMessage,
  onClearError,
}) => (
  <>
    <button
      type="button"
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
      onClick={onBack}
    >
      <ArrowLeft size={16} />
      Volver al panel
    </button>

    <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
      <div className="h-1.5 bg-[var(--color-yellow)]" />
      <div className="p-6">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
          Usuarios del sistema
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Registrar Usuario</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
          Crear cuentas para miembros del cuerpo tecnico, delegados y administradores.
          Los deportistas se registran desde Inscribir Deportista. La contrasena
          inicial sera el numero de CI del usuario.
        </p>
      </div>
    </div>

    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        {message && <Alert type="success" message={message} onClose={onClearMessage} />}
        {error && <Alert type="warning" message={error} onClose={onClearError} />}
        <PersonFields formData={formData} setFormData={setFormData} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Rol"
            value={formData.id_rol}
            onChange={(event) =>
              setFormData({
                ...formData,
                id_rol: event.target.value,
                id_carrera: "",
                gestion: "",
              })
            }
            options={staffRoles.map((rol) => ({
              value: rol.id_rol,
              label: rol.nombre_rol,
            }))}
            required
          />
        </div>
        {isDelegado && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Carrera"
              value={formData.id_carrera}
              onChange={(event) =>
                setFormData({ ...formData, id_carrera: event.target.value })
              }
              options={carreras.map((carrera) => ({
                value: carrera.id_carrera,
                label: carrera.sigla
                  ? `${carrera.nombre} (${carrera.sigla})`
                  : carrera.nombre,
              }))}
              required
            />
            <Input
              label="Gestion"
              placeholder="Ej: 2024-1"
              value={formData.gestion}
              onChange={(event) =>
                setFormData({ ...formData, gestion: event.target.value })
              }
              required
            />
          </div>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || staffRoles.length === 0}
        >
          {isSubmitting ? "Registrando..." : "Registrar usuario"}
        </Button>
      </form>
    </Card>
  </>
);

const PersonFields = ({ formData, setFormData }: any) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <Input label="Nombres" value={formData.nombres} onChange={(event) => setFormData({ ...formData, nombres: event.target.value })} required />
    <Input label="Apellido paterno" value={formData.ape_paterno} onChange={(event) => setFormData({ ...formData, ape_paterno: event.target.value })} required />
    <Input label="Apellido materno" value={formData.ape_materno} onChange={(event) => setFormData({ ...formData, ape_materno: event.target.value })} />
    <Input label="Fecha de nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(event) => setFormData({ ...formData, fecha_nacimiento: event.target.value })} required />
    <Input label="CI" value={formData.ci} onChange={(event) => setFormData({ ...formData, ci: event.target.value })} required />
    <Input label="Celular" value={formData.celular} onChange={(event) => setFormData({ ...formData, celular: event.target.value })} required />
    <Input label="Correo electronico" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required />
  </div>
);

export default AdminPage;
