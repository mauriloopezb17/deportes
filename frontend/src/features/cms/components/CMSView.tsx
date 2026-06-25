import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { Layout } from "@components/layout";
import { Alert, Button, Card, Input, Modal, Select } from "@components/common";
import { partidoService, torneoService } from "@/features/tournaments/services/tournamentService";
import { Partido, Torneo } from "@types";

const emptyForm = {
  tipo_archivo: "Foto",
  archivo_url: "",
  torneo_id: "",
  partido_id: "",
  publicar: false,
};

const CMSPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [fileName, setFileName] = useState("");
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [torneosResponse, partidosResponse] = await Promise.all([
          torneoService.obtenerTorneos(),
          partidoService.obtenerPartidos(),
        ]);
        setTorneos(torneosResponse.data);
        setPartidos(partidosResponse.data);
      } catch {
        setError("No se pudieron cargar torneos y partidos.");
      }
    };

    void loadOptions();
  }, []);

  const partidosFiltrados = useMemo(() => {
    if (!formData.torneo_id) return partidos;

    return partidos.filter(
      (partido) =>
        String((partido as any).torneo_id ?? partido.torneo?.id ?? "") ===
        formData.torneo_id,
    );
  }, [formData.torneo_id, partidos]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFormData({
      ...formData,
      archivo_url: formData.archivo_url || file.name,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.archivo_url.trim()) {
      setError("Sube un archivo o pega una URL.");
      return;
    }

    if (!formData.torneo_id || !formData.partido_id) {
      setError("Selecciona torneo y partido relacionado.");
      return;
    }

    setMessage("Archivo preparado para publicarse en la galeria.");
    setFormData(emptyForm);
    setFileName("");
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Galeria del portal
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Agrega fotos o videos relacionados a torneos y partidos.
            </p>
          </div>
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => {
              setIsModalOpen(true);
              setError(null);
            }}
          >
            <ImagePlus size={20} />
            Agregar a la galeria
          </Button>
        </div>

        {message && (
          <Alert
            type="success"
            message={message}
            onClose={() => setMessage(null)}
          />
        )}
        {error && !isModalOpen && (
          <Alert type="warning" message={error} onClose={() => setError(null)} />
        )}

        <Card>
          <p className="text-sm text-gray-600">
            Todavia no hay una lista de archivos publicada desde este modulo.
          </p>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          title="Agregar a la galeria"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert
                type="warning"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            <Select
              label="Tipo de archivo"
              value={formData.tipo_archivo}
              onChange={(event) =>
                setFormData({ ...formData, tipo_archivo: event.target.value })
              }
              options={[
                { value: "Foto", label: "Foto" },
                { value: "Video", label: "Video" },
              ]}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Subir imagen
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="danger"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                Elegir archivo
              </Button>
              {fileName && (
                <p className="mt-2 text-sm text-gray-500">{fileName}</p>
              )}
            </div>

            <Input
              label="URL del archivo (o pega una URL)"
              placeholder="https://... (se llena automaticamente al subir)"
              value={formData.archivo_url}
              onChange={(event) =>
                setFormData({ ...formData, archivo_url: event.target.value })
              }
              fullWidth
            />

            <Select
              label="Torneo relacionado"
              value={formData.torneo_id}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  torneo_id: event.target.value,
                  partido_id: "",
                })
              }
              options={torneos.map((torneo) => ({
                value: torneo.id,
                label: torneo.nombre,
              }))}
              required
            />

            <Select
              label="Partido relacionado"
              value={formData.partido_id}
              onChange={(event) =>
                setFormData({ ...formData, partido_id: event.target.value })
              }
              options={partidosFiltrados.map((partido) => ({
                value: partido.id,
                label: [
                  partido.equipo_local?.nombre || "Local",
                  "vs",
                  partido.equipo_visitante?.nombre || "Visitante",
                ].join(" "),
              }))}
              required
            />

            <label className="flex items-center gap-3 text-sm font-semibold text-primary-800">
              <input
                type="checkbox"
                checked={formData.publicar}
                onChange={(event) =>
                  setFormData({ ...formData, publicar: event.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Publicar inmediatamente en el portal
            </label>

            <div className="flex justify-end gap-3 border-t border-primary-100 pt-4">
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CMSPage;
