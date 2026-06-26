import { BadGatewayException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface EspacioInfraestructura {
  id: number;
  nombre: string;
  horario_apertura?: string | null;
  horario_cierre?: string | null;
  activo: boolean;
}

@Injectable()
export class CanchaService {
  private readonly infraestructuraBaseUrl = (
    process.env.INFRAESTRUCTURA_SERVICE_URL || "http://localhost:3006/api"
  ).replace(/\/+$/, "");

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
    const espacios = await this.requestInfraestructura<EspacioInfraestructura[]>(
      "/espacios",
    );

    if (!Array.isArray(espacios)) {
      throw new BadGatewayException(
        "El servicio de infraestructura devolvio una respuesta invalida",
      );
    }

    return espacios.map((espacio) => this.toLegacyCancha(espacio));
  }

  async getRangoHorario() {
    return this.requestInfraestructura("/espacios/rango-horario");
  }

  async findOne(id: number) {
    const espacio = await this.requestInfraestructura<EspacioInfraestructura>(
      `/espacios/${id}`,
      true,
    );
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
      id: espacio.id ?? espacio.id_espacio,
      nombre: espacio.nombre ?? espacio.nombre_espacio,
      ubicacion: "",
      capacidad: 0,
      tipo_superficie: "",
      estado: espacio.activo ? "disponible" : "mantenimiento",
      hora_apertura: espacio.horario_apertura ?? espacio.hora_apertura,
      hora_cierre: espacio.horario_cierre,
    };
  }

  private async requestInfraestructura<T>(
    path: string,
    returnNullOnNotFound = false,
  ): Promise<T | null> {
    let response: Response;

    try {
      response = await fetch(`${this.infraestructuraBaseUrl}${path}`);
    } catch {
      throw new BadGatewayException(
        "No se pudo conectar con el servicio de infraestructura",
      );
    }

    if (response.status === 404 && returnNullOnNotFound) {
      return null;
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `El servicio de infraestructura respondio con estado ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }

  private timeToDate(value: string) {
    return new Date(`1970-01-01T${value}:00.000Z`);
  }
}
