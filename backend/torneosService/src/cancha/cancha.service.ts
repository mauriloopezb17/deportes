import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CanchaService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const espacio = await this.prisma.espacios.create({
      data: {
        nombre_espacio: data.nombre,
        hora_apertura: this.timeToDate("07:00"),
        activo: data.estado ? data.estado !== "mantenimiento" : true,
      },
    });
    return this.toLegacyCancha(espacio);
  }

  async findAll() {
    const espacios = await this.prisma.espacios.findMany({
      orderBy: { id_espacio: "asc" },
    });
    return espacios.map((espacio) => this.toLegacyCancha(espacio));
  }

  async findOne(id: number) {
    const espacio = await this.prisma.espacios.findUnique({
      where: { id_espacio: id },
    });
    return espacio ? this.toLegacyCancha(espacio) : null;
  }

  async update(id: number, data: any) {
    const espacio = await this.prisma.espacios.update({
      where: { id_espacio: id },
      data: {
        ...(data.nombre ? { nombre_espacio: data.nombre } : {}),
        ...(data.estado ? { activo: data.estado !== "mantenimiento" } : {}),
      },
    });
    return this.toLegacyCancha(espacio);
  }

  async remove(id: number) {
    await this.prisma.espacios.delete({ where: { id_espacio: id } });
  }

  private toLegacyCancha(espacio: any) {
    return {
      id: espacio.id_espacio,
      nombre: espacio.nombre_espacio,
      ubicacion: "",
      capacidad: 0,
      tipo_superficie: "",
      estado: espacio.activo ? "disponible" : "mantenimiento",
      hora_apertura: espacio.hora_apertura,
    };
  }

  private timeToDate(value: string) {
    return new Date(`1970-01-01T${value}:00.000Z`);
  }
}
