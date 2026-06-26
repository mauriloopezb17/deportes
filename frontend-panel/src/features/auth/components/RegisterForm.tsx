import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Alert, Button, Input, Select } from "@components/common";
import { authService } from "@/features/auth/services/authService";

interface RegisterFormData {
  nombre: string;
  apellido: string;
  carnet: string;
  email: string;
  celular: string;
  rol: "JUGADOR" | "ADMIN" | "DELEGADO";
  password: string;
  passwordConfirm: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuthStore();
  const [formData, setFormData] = useState<RegisterFormData>({
    nombre: "",
    apellido: "",
    carnet: "",
    email: "",
    celular: "",
    rol: "JUGADOR",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const normalizeForm = (): RegisterFormData => ({
    ...formData,
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    carnet: formData.carnet.trim(),
    email: formData.email.trim().toLowerCase(),
    celular: formData.celular.trim(),
    password: formData.password.trim(),
    passwordConfirm: formData.passwordConfirm.trim(),
  });

  const validateForm = (data: RegisterFormData): boolean => {
    if (
      !data.nombre ||
      !data.apellido ||
      !data.carnet ||
      !data.email ||
      !data.celular ||
      !data.password ||
      !data.passwordConfirm
    ) {
      setError("Por favor completa todos los campos");
      return false;
    }

    if (!data.email.endsWith("@ucb.edu.bo")) {
      setError("El email debe ser del dominio @ucb.edu.bo");
      return false;
    }

    if (data.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return false;
    }

    if (data.password !== data.passwordConfirm) {
      setError("Las contrasenas no coinciden");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedData = normalizeForm();
    setFormData(normalizedData);

    if (!validateForm(normalizedData)) {
      return;
    }

    try {
      await authService.register({
        nombre: normalizedData.nombre,
        apellido: normalizedData.apellido,
        carnet: normalizedData.carnet,
        email: normalizedData.email,
        celular: normalizedData.celular,
        rol: normalizedData.rol,
        password: normalizedData.password,
      });

      setSuccess("Registro exitoso. Redirigiendo al login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      const conflictMessage =
        err.response?.status === 409
          ? "El email o carnet ya esta registrado"
          : undefined;

      setError(
        err.response?.data?.message ||
          conflictMessage ||
          err.message ||
          "Error al registrarse",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-600 to-secondary-600 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Registro
        </h1>
        <p className="mb-8 text-center text-gray-600">Crear nueva cuenta</p>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            closable
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
            closable
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan"
              required
            />

            <Input
              label="Apellido"
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Perez"
              required
            />
          </div>

          <Input
            label="Carnet"
            type="text"
            name="carnet"
            value={formData.carnet}
            onChange={handleChange}
            placeholder="12345678"
            fullWidth
            required
          />

          <Input
            label="Email (UCB)"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="juan@ucb.edu.bo"
            fullWidth
            required
          />

          <Input
            label="Celular"
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="76543210"
            fullWidth
            required
          />

          <Select
            label="Rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            options={[
              { value: "JUGADOR", label: "Jugador" },
              { value: "DELEGADO", label: "Delegado" },
              { value: "ADMIN", label: "Administrador" },
            ]}
            fullWidth
            required
          />

          <Input
            label="Contrasena"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            fullWidth
            required
          />

          <Input
            label="Confirmar contrasena"
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="********"
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
          >
            Registrarse
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
