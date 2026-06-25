import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, Mail } from "lucide-react";
import { Alert, Button, Input } from "@components/common";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { UserRole } from "@types";
import logoSrc from "../../../components/images/Logo color - azul (1).png";

const getDefaultPath = (hasRole: (rol: UserRole | UserRole[]) => boolean) => {
  if (hasRole(UserRole.ADMIN)) return "/panel-admin";
  if (hasRole(UserRole.DELEGADO)) return "/panel-delegado";
  if (hasRole(UserRole.ENTRENADOR)) return "/panel-entrenador";
  return "/dashboard";
};

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, setError, hasRole } =
    useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDefaultPath(hasRole), { replace: true });
    }
  }, [hasRole, isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate(getDefaultPath(useAuthStore.getState().hasRole), {
        replace: true,
      });
    } catch {
      // El store ya guarda el mensaje del backend.
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
        <div className="w-full overflow-hidden rounded-lg border border-primary-100 bg-white shadow-xl">
          <div className="h-3 bg-[linear-gradient(90deg,var(--color-navy)_0%,var(--color-navy)_34%,var(--color-cyan)_34%,var(--color-cyan)_68%,var(--color-yellow)_68%,var(--color-yellow)_100%)]" />
          <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[1fr_420px]">
            <section className="flex flex-col justify-between bg-[var(--color-navy)] p-8 text-white">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={logoSrc}
                    alt="Gestion Deportiva"
                    className="h-16 w-16 rounded-lg bg-white object-contain p-1"
                  />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-accent-500">
                      Universidad Catolica Boliviana
                    </p>
                    <h1 className="text-2xl font-bold">Gestion Deportiva</h1>
                  </div>
                </div>

                <div className="mt-16 max-w-md">
                  <p className="text-sm font-bold uppercase tracking-wide text-accent-500">
                    Acceso al sistema
                  </p>
                  <h2 className="mt-3 text-4xl font-bold leading-tight">
                    Inicia sesion con tu cuenta asignada
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-primary-100">
                    El sistema habilita automaticamente las opciones segun tu rol:
                    administrador, delegado o entrenador.
                  </p>
                </div>
              </div>

              <p className="mt-10 text-xs text-primary-100">
                Usa las credenciales registradas por administracion.
              </p>
            </section>

            <section className="flex items-center p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="w-full space-y-5">
                <div>
                  <h2 className="text-3xl font-bold text-gray-950">
                    Bienvenido
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Ingresa tu correo y contrasena para continuar.
                  </p>
                </div>

                {error && (
                  <Alert
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                    closable
                  />
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-3 top-[42px] text-gray-400"
                    />
                    <Input
                      label="Correo electronico"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      fullWidth
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="pointer-events-none absolute left-3 top-[42px] text-gray-400"
                    />
                    <Input
                      label="Contrasena"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-10"
                      autoComplete="current-password"
                      fullWidth
                      required
                    />
                  </div>
                </div>

                <Button type="submit" fullWidth isLoading={isLoading}>
                  <LogIn size={18} />
                  Iniciar sesion
                </Button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
