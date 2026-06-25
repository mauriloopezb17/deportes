import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReservaService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const solicitante = await this.prisma.personas.findFirst({
      include: { usuarios: true },
      orderBy: { id_persona: "asc" },
    });

    if (!solicitante) {
      throw new BadRequestException("No existe una persona para registrar la reserva");
    }

    const lastReserva = await this.prisma.reservas.findFirst({
      orderBy: { id_reserva: "desc" },
    });
    const idReserva = (lastReserva?.id_reserva || 0) + 1;

    const reserva = await this.prisma.reservas.create({
      data: {
        id_reserva: idReserva,
        id_espacio: data.cancha_id,
        id_persona_aprobador: solicitante.id_persona,
        fecha_reserva: new Date(data.fecha),
        hora_inicio: this.timeToDate(data.hora_inicio),
        hora_fin: this.timeToDate(data.hora_fin),
        tipo_reserva: data.equipo_id ? "Equipo" : "General",
        motivo: data.observaciones,
        estado: this.toCloudEstado(data.estado),
        nombre_solicitante: [
          solicitante.nombres,
          solicitante.ape_paterno,
          solicitante.ape_materno,
        ]
          .filter(Boolean)
          .join(" ")
          .trim(),
        ci: solicitante.ci,
        complemento: solicitante.complemento,
        correo_solicitante: solicitante.usuarios?.[0]?.email || "sin-correo@ucb.edu.bo",
      },
      include: this.includeRelations(),
    });

    return this.toLegacyReserva(reserva);
  }

  async findAll(fecha?: string, equipoId?: number) {
    const reservas = await this.prisma.reservas.findMany({
      where: {
        ...(fecha ? { fecha_reserva: new Date(fecha) } : {}),
      },
      include: this.includeRelations(),
      orderBy: [{ fecha_reserva: "asc" }, { hora_inicio: "asc" }],
    });

    return reservas
      .map((reserva) => this.toLegacyReserva(reserva))
      .filter((reserva) => !equipoId || reserva.equipo_id === equipoId);
  }

  async findOne(id: number) {
    const reserva = await this.prisma.reservas.findUnique({
      where: { id_reserva: id },
      include: this.includeRelations(),
    });
    return reserva ? this.toLegacyReserva(reserva) : null;
  }

  async update(id: number, data: any) {
    const reserva = await this.prisma.reservas.update({
      where: { id_reserva: id },
      data: {
        ...(data.cancha_id ? { id_espacio: data.cancha_id } : {}),
        ...(data.fecha ? { fecha_reserva: new Date(data.fecha) } : {}),
        ...(data.hora_inicio ? { hora_inicio: this.timeToDate(data.hora_inicio) } : {}),
        ...(data.hora_fin ? { hora_fin: this.timeToDate(data.hora_fin) } : {}),
        ...(data.estado ? { estado: this.toCloudEstado(data.estado) } : {}),
        ...(data.observaciones ? { motivo: data.observaciones } : {}),
      },
      include: this.includeRelations(),
    });
    return this.toLegacyReserva(reserva);
  }

  async remove(id: number) {
    await this.prisma.reservas.delete({ where: { id_reserva: id } });
  }

  private includeRelations() {
    return {
      espacios: true,
      personas: true,
    };
  }

  private toLegacyReserva(reserva: any) {
    return {
      id: reserva.id_reserva,
      cancha_id: reserva.id_espacio,
      equipo_id: undefined,
      fecha: reserva.fecha_reserva,
      hora_inicio: this.dateToTime(reserva.hora_inicio),
      hora_fin: this.dateToTime(reserva.hora_fin),
      estado: this.toLegacyEstado(reserva.estado),
      observaciones: reserva.motivo,
      cancha: reserva.espacios
        ? {
            id: reserva.espacios.id_espacio,
            nombre: reserva.espacios.nombre_espacio,
            estado: reserva.espacios.activo ? "disponible" : "mantenimiento",
          }
        : undefined,
      equipo: undefined,
      solicitante: reserva.nombre_solicitante,
      correo_solicitante: reserva.correo_solicitante,
    };
  }

  private toCloudEstado(estado?: string) {
    const estados: Record<string, string> = {
      confirmada: "Aprobada",
      pendiente: "Pendiente",
      cancelada: "Cancelada",
    };
    return estados[estado || ""] || "Pendiente";
  }

  private toLegacyEstado(estado?: string) {
    const estados: Record<string, string> = {
      Aprobada: "confirmada",
      Pendiente: "pendiente",
      Cancelada: "cancelada",
    };
    return estados[estado || ""] || estado;
  }

  private timeToDate(value: string) {
    return new Date(`1970-01-01T${value}:00.000Z`);
  }

  private dateToTime(value?: Date) {
    if (!value) {
      return undefined;
    }
    return value.toISOString().slice(11, 16);
  }
}
