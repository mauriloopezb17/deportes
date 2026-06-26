import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { UserRole } from "@types";
import { ImagePlus, LogOut, Menu, Upload, User } from "lucide-react";
import { Input, Modal, Select } from "@components/common";
import logoSrc from "../images/Logo color - azul (1).png";

const emptyGalleryForm = {
  tipo_archivo: "foto",
  archivo_nombre: "",
  url_archivo: "",
  torneo_relacionado: "",
  partido_relacionado: "",
  publicar: false,
};

interface HeaderProps {
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, actions }) => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = React.useState(false);
  const [galleryForm, setGalleryForm] = React.useState(emptyGalleryForm);
  const isAdmin = usuario?.roles?.includes(UserRole.ADMIN);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const goToProfile = () => {
    setShowDropdown(false);
    navigate("/perfil");
  };

  const handleGallerySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setGalleryForm(emptyGalleryForm);
    setIsGalleryModalOpen(false);
  };

  return (
    <>
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
              <div className="group flex items-center gap-3">
                <a
                  href="https://test.62344037.xyz/"
                  aria-label="Ir al portal de Gestion Deportiva"
                  className="shrink-0 focus:outline-none"
                >
                  <img
                    src={logoSrc}
                    alt="Gestion Deportiva"
                    className="h-11 w-11 object-contain transition-transform duration-200 group-hover:scale-105 group-focus-within:scale-105"
                  />
                </a>
                <a
                  href="https://test.62344037.xyz/"
                  className="focus:outline-none"
                >
                  <h1 className="text-xl font-bold text-white">
                    Gestion Deportiva
                  </h1>
                  <p className="hidden text-xs font-medium text-white/85 sm:block">
                    Panel universitario
                  </p>
                </a>
              </div>
            </div>

            <div className="relative flex items-center gap-3">
              {actions}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    setIsGalleryModalOpen(true);
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:brightness-105"
                  style={{
                    backgroundColor: "var(--color-cyan)",
                    borderColor: "rgba(255,255,255,0.45)",
                  }}
                >
                  <ImagePlus size={18} />
                  <span className="hidden md:inline">Subir a galeria</span>
                </button>
              )}
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

      <GalleryModal
        isOpen={isGalleryModalOpen}
        formData={galleryForm}
        setFormData={setGalleryForm}
        onClose={() => {
          setIsGalleryModalOpen(false);
          setGalleryForm(emptyGalleryForm);
        }}
        onSubmit={handleGallerySubmit}
      />
    </>
  );
};

interface GalleryModalProps {
  isOpen: boolean;
  formData: typeof emptyGalleryForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyGalleryForm>>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  formData,
  setFormData,
  onClose,
  onSubmit,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Agregar a la galeria" size="lg">
    <form onSubmit={onSubmit} className="space-y-5">
      <Select
        label="Tipo de archivo"
        value={formData.tipo_archivo}
        onChange={(event) =>
          setFormData({ ...formData, tipo_archivo: event.target.value })
        }
        options={[
          { value: "foto", label: "Foto" },
          { value: "video", label: "Video" },
          { value: "documento", label: "Documento" },
        ]}
        required
      />

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Subir imagen
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-sm transition-colors hover:bg-primary-50">
          <Upload size={18} />
          Elegir archivo
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={(event) =>
              setFormData({
                ...formData,
                archivo_nombre: event.target.files?.[0]?.name || "",
              })
            }
          />
        </label>
        {formData.archivo_nombre && (
          <p className="mt-2 text-sm text-gray-500">{formData.archivo_nombre}</p>
        )}
      </div>

      <Input
        label="URL del archivo (o pega una URL)"
        placeholder="https://... (se llena automaticamente al subir)"
        value={formData.url_archivo}
        onChange={(event) =>
          setFormData({ ...formData, url_archivo: event.target.value })
        }
        fullWidth
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Torneo relacionado"
          value={formData.torneo_relacionado}
          onChange={(event) =>
            setFormData({
              ...formData,
              torneo_relacionado: event.target.value,
              partido_relacionado: "",
            })
          }
          options={[
            { value: "torneo-actual", label: "Torneo actual" },
            { value: "intercarreras", label: "Intercarreras" },
            { value: "amistoso", label: "Amistoso" },
          ]}
          required
        />
        <Select
          label="Partido relacionado"
          value={formData.partido_relacionado}
          onChange={(event) =>
            setFormData({ ...formData, partido_relacionado: event.target.value })
          }
          options={[
            { value: "partido-1", label: "Partido 1" },
            { value: "partido-2", label: "Partido 2" },
            { value: "partido-3", label: "Partido 3" },
          ]}
          required
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-primary-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          checked={formData.publicar}
          onChange={(event) =>
            setFormData({ ...formData, publicar: event.target.checked })
          }
        />
        Publicar inmediatamente en el portal
      </label>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          className="rounded-lg border border-primary-200 bg-white px-4 py-2 font-semibold text-primary-800 hover:bg-primary-50"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-yellow)] px-4 py-2 font-semibold text-[var(--color-navy)] hover:brightness-105"
        >
          Guardar
        </button>
      </div>
    </form>
  </Modal>
);

export default Header;
