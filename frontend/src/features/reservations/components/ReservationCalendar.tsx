import React, { useEffect, useMemo, useState } from "react";
import CalendarWidget from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  MapPin,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { Reserva } from "@types";
import { useReservationStore } from "@/features/reservations/stores/reservationStore";
import { Button, Card, Modal, Input, Select } from "@components/common";
import { canchaService } from "@/features/reservations/services/fieldService";
import { equipoService } from "@/features/teams/services/equipoService";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatLongDate = (date: Date) =>
  date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const statusStyles = {
  confirmada: "bg-emerald-50 border-emerald-200 text-emerald-800",
  pendiente: "bg-amber-50 border-amber-200 text-amber-800",
  cancelada: "bg-red-50 border-red-200 text-red-800",
};

const ReservationCalendar: React.FC = () => {
  const {
    reservas,
    isLoading,
    obtenerReservas,
    crearReserva,
    actualizarReserva,
    cancelarReserva,
    eliminarReserva,
  } = useReservationStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [canchas, setCanchas] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cancha_id: "",
    equipo_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
  });

  useEffect(() => {
    obtenerReservas();
    cargarCanchas();
    cargarEquipos();
  }, [obtenerReservas]);

  const cargarCanchas = async () => {
    try {
      const response = await canchaService.obtenerCanchas();
      setCanchas(response.data);
    } catch (error) {
      console.error("Error al cargar canchas:", error);
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await equipoService.obtenerEquipos();
      setEquipos(response.data);
    } catch (error) {
      console.error("Error al cargar equipos:", error);
    }
  };

  const reservationsByDate = useMemo(
    () =>
      reservas.reduce<Record<string, Reserva[]>>((acc, reserva) => {
        acc[reserva.fecha] = [...(acc[reserva.fecha] || []), reserva];
        return acc;
      }, {}),
    [reservas],
  );

  const selectedDateKey = formatDateKey(selectedDate);
  const dayReservations = (reservationsByDate[selectedDateKey] || []).sort(
    (a, b) => a.hora_inicio.localeCompare(b.hora_inicio),
  );
  const confirmedCount = reservas.filter((r) => r.estado === "confirmada").length;
  const pendingCount = reservas.filter((r) => r.estado === "pendiente").length;
  const activeCourts = new Set(
    reservas.filter((r) => r.estado !== "cancelada").map((r) => r.cancha?.id),
  ).size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cancha_id: parseInt(formData.cancha_id),
        equipo_id: formData.equipo_id ? parseInt(formData.equipo_id) : undefined,
      };
      if (editingId) {
        await actualizarReserva(editingId, payload);
      } else {
        await crearReserva(payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        cancha_id: "",
        equipo_id: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
      });
      obtenerReservas();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      cancha_id: "",
      equipo_id: "",
      fecha: selectedDateKey,
      hora_inicio: "",
      hora_fin: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (reserva: Reserva) => {
    setEditingId(reserva.id);
    setFormData({
      cancha_id: String(reserva.cancha_id ?? reserva.cancha?.id ?? ""),
      equipo_id: String(reserva.equipo_id ?? reserva.equipo?.id ?? ""),
      fecha: reserva.fecha,
      hora_inicio: reserva.hora_inicio,
      hora_fin: reserva.hora_fin,
    });
    setIsModalOpen(true);
  };

  const handleCalendarChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg bg-[var(--color-navy)] text-white shadow-sm">
        <div className="h-1.5 bg-[var(--color-yellow)]" />
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--color-yellow)]">
              Gestion de espacios deportivos
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Reserva de Canchas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              Consulta disponibilidad por fecha, organiza horarios y administra
              solicitudes de reserva desde un calendario mensual.
            </p>
          </div>
          <Button variant="primary" onClick={openCreate} className="gap-2">
            <Plus size={20} />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Confirmadas"
          value={confirmedCount}
          icon={<CheckCircle2 size={20} />}
          className="border-emerald-200 bg-emerald-50 text-emerald-900"
        />
        <MetricCard
          label="Pendientes"
          value={pendingCount}
          icon={<Clock size={20} />}
          className="border-amber-200 bg-amber-50 text-amber-900"
        />
        <MetricCard
          label="Canchas activas"
          value={activeCourts}
          icon={<MapPin size={20} />}
          className="border-sky-200 bg-sky-50 text-sky-900"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Calendario</h2>
              <p className="text-sm text-gray-500">
                Selecciona un día para ver sus reservas.
              </p>
            </div>
            <Calendar className="text-primary-600" size={24} />
          </div>

          <CalendarWidget
            onChange={handleCalendarChange}
            value={selectedDate}
            locale="es-ES"
            prevLabel={<ChevronLeft size={18} />}
            nextLabel={<ChevronRight size={18} />}
            prev2Label={null}
            next2Label={null}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const count = reservationsByDate[formatDateKey(date)]?.length || 0;
              if (!count) return null;
              return (
                <span className="mx-auto mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              );
            }}
            tileClassName={({ date, view }) =>
              view === "month" && formatDateKey(date) === selectedDateKey
                ? "reservation-calendar__selected"
                : undefined
            }
            className="reservation-calendar"
          />
        </Card>

        <Card>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold capitalize text-gray-900">
                {formatLongDate(selectedDate)}
              </h2>
              <p className="text-sm text-gray-500">
                {dayReservations.length} reserva
                {dayReservations.length === 1 ? "" : "s"} programada
                {dayReservations.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-300 border-t-primary-600" />
            </div>
          ) : dayReservations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <Calendar className="mx-auto text-gray-400" size={36} />
              <p className="mt-3 font-semibold text-gray-700">
                No hay reservas para este día
              </p>
              <p className="text-sm text-gray-500">
                Puedes crear una reserva usando el boton Nueva Reserva.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayReservations.map((reserva) => (
                <ReservationItem
                  key={reserva.id}
                  reserva={reserva}
                  onEdit={() => openEdit(reserva)}
                  onDelete={() => eliminarReserva(reserva.id)}
                  onConfirm={() =>
                    actualizarReserva(reserva.id, { estado: "confirmada" })
                  }
                  onCancel={() =>
                    cancelarReserva(reserva.id, "Cancelado por usuario")
                  }
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        canchas={canchas}
        equipos={equipos}
        isEditing={Boolean(editingId)}
      />
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  className,
}) => (
  <div className={`rounded-lg border p-4 ${className}`}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold uppercase">{label}</span>
      {icon}
    </div>
    <p className="mt-3 text-3xl font-bold">{value}</p>
  </div>
);

interface ReservationItemProps {
  reserva: Reserva;
  onEdit: () => void;
  onDelete: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReservationItem: React.FC<ReservationItemProps> = ({
  reserva,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
}) => (
  <div
    className={`rounded-lg border p-4 ${
      statusStyles[reserva.estado] || "border-gray-200 bg-white text-gray-800"
    }`}
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">
            {reserva.cancha?.nombre || "Cancha sin nombre"}
          </h3>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold capitalize">
            {reserva.estado}
          </span>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-3">
          <span className="flex items-center gap-2">
            <Clock size={16} />
            {reserva.hora_inicio} - {reserva.hora_fin}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={16} />
            {reserva.cancha?.ubicacion || "Sin ubicación"}
          </span>
          <span className="flex items-center gap-2">
            {reserva.estado === "cancelada" ? (
              <XCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {reserva.equipo?.nombre || "Sin equipo asignado"}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <Edit2 size={16} />
        </Button>
        {reserva.estado === "pendiente" && (
          <>
            <Button variant="success" size="sm" onClick={onConfirm}>
              Confirmar
            </Button>
            <Button variant="danger" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          </>
        )}
        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  </div>
);

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  canchas: any[];
  equipos: any[];
  isEditing: boolean;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  canchas,
  equipos,
  isEditing,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Reserva" : "Nueva Reserva"}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select
          label="Cancha"
          value={formData.cancha_id}
          onChange={(e) =>
            setFormData({ ...formData, cancha_id: e.target.value })
          }
          options={canchas.map((c) => ({ value: c.id, label: c.nombre }))}
          fullWidth
          required
        />

        <Select
          label="Equipo"
          value={formData.equipo_id}
          onChange={(e) =>
            setFormData({ ...formData, equipo_id: e.target.value })
          }
          options={equipos.map((equipo) => ({
            value: equipo.id,
            label: equipo.nombre,
          }))}
          fullWidth
        />

        <Input
          label="Fecha"
          type="date"
          value={formData.fecha}
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          fullWidth
          required
        />

        <Input
          label="Hora Inicio"
          type="time"
          value={formData.hora_inicio}
          onChange={(e) =>
            setFormData({ ...formData, hora_inicio: e.target.value })
          }
          fullWidth
          required
        />

        <Input
          label="Hora Fin"
          type="time"
          value={formData.hora_fin}
          onChange={(e) =>
            setFormData({ ...formData, hora_fin: e.target.value })
          }
          fullWidth
          required
        />

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? "Actualizar" : "Crear"} Reserva
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationCalendar;
