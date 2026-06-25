import React, { useEffect, useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Layout } from "@components/layout";
import { Alert, Button, Card, Input, Select } from "@components/common";
import {
  carreraService,
  disciplinaService,
} from "@/features/disciplines/services/disciplinaService";

type UserFormRole = "DELEGADO" | "ENTRENADOR" | "ADMIN";

const emptyUserForm = {
  nombres: "",
  ape_paterno: "",
  ape_materno: "",
  fecha_nacimiento: "",
  ci: "",
  complemento: "",
  celular: "",
  email: "",
  rol: "",
  id_carrera: "",
  gestion: "",
  id_disciplina: "",
};

const AdminPage: React.FC = () => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [carreras, setCarreras] = useState<Array<{ id: number; nombre: string }>>(
    [],
  );
  const [disciplinas, setDisciplinas] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      const [carrerasResponse, disciplinasResponse] = await Promise.all([
        carreraService.obtenerCarreras(),
        disciplinaService.obtenerDisciplinas(),
      ]);

      setCarreras(carrerasResponse.data);
      setDisciplinas(disciplinasResponse.data);
    };

    void loadOptions();
  }, []);

  const selectedRole = userForm.rol as UserFormRole | "";

  const handleUserSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!userForm.rol) {
      setError("Selecciona un rol para el usuario.");
      return;
    }
    if (selectedRole === "DELEGADO" && (!userForm.id_carrera || !userForm.gestion)) {
      setError("Para delegado, selecciona carrera y gestion.");
      return;
    }
    if (selectedRole === "ENTRENADOR" && !userForm.id_disciplina) {
      setError("Para entrenador, selecciona una disciplina.");
      return;
    }

    setMessage("Formulario preparado para conectarlo al login de tu companero.");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {showUserForm ? (
          <UserForm
            formData={userForm}
            setFormData={setUserForm}
            selectedRole={selectedRole}
            carreras={carreras}
            disciplinas={disciplinas}
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
  selectedRole: UserFormRole | "";
  carreras: Array<{ id: number; nombre: string }>;
  disciplinas: Array<{ id: number; nombre: string }>;
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
  selectedRole,
  carreras,
  disciplinas,
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
            value={formData.rol}
            onChange={(event) =>
              setFormData({
                ...formData,
                rol: event.target.value,
                id_carrera: "",
                gestion: "",
                id_disciplina: "",
              })
            }
            options={[
              { value: "DELEGADO", label: "Delegado" },
              { value: "ENTRENADOR", label: "Entrenador" },
              { value: "ADMIN", label: "Administrador" },
            ]}
            required
          />
        </div>
        {selectedRole === "DELEGADO" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Carrera"
              value={formData.id_carrera}
              onChange={(event) =>
                setFormData({ ...formData, id_carrera: event.target.value })
              }
              options={carreras.map((carrera) => ({
                value: carrera.id,
                label: carrera.nombre,
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
        {selectedRole === "ENTRENADOR" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Disciplina"
              value={formData.id_disciplina}
              onChange={(event) =>
                setFormData({ ...formData, id_disciplina: event.target.value })
              }
              options={disciplinas.map((disciplina) => ({
                value: disciplina.id,
                label: disciplina.nombre,
              }))}
              required
            />
          </div>
        )}
        <Button variant="primary" type="submit">
          Registrar usuario
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
    <Input label="Complemento CI" placeholder="Ej: 1A" value={formData.complemento} onChange={(event) => setFormData({ ...formData, complemento: event.target.value })} />
    <Input label="Celular" value={formData.celular} onChange={(event) => setFormData({ ...formData, celular: event.target.value })} required />
    <Input label="Correo electronico" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required />
  </div>
);

export default AdminPage;
