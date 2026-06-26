import { Injectable, NotFoundException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTorneoDto } from "./dto/create-torneo.dto";
import { UpdateTorneoDto } from "./dto/update-torneo.dto";

@ApiTags("Torneos")
@Injectable()
export class TorneoService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Crear un nuevo torneo" })
  async create(createTorneoDto: CreateTorneoDto) {
    const torneo = await this.prisma.torneos.create({
      data: {
        nombre: createTorneoDto.nombre,
        tipo_torneo: createTorneoDto.tipo,
        estado: this.toCloudEstado(createTorneoDto.estado),
        id_disciplina: createTorneoDto.disciplina_id,
        gestion: new Date().getFullYear(),
        fecha_inicio: createTorneoDto.fecha_inicio
          ? new Date(createTorneoDto.fecha_inicio)
          : undefined,
        fecha_fin: createTorneoDto.fecha_fin
          ? new Date(createTorneoDto.fecha_fin)
          : undefined,
        imagen: createTorneoDto.imagen_url,
      },
      include: { disciplinas: true },
    });
    return this.toLegacyTorneo(torneo);
  }

  @ApiOperation({ summary: "Obtener todos los torneos" })
  async findAll() {
    const torneos = await this.prisma.torneos.findMany({
      include: { disciplinas: true },
      orderBy: { id_torneo: "asc" },
    });
    return torneos.map((torneo) => this.toLegacyTorneo(torneo));
  }

  @ApiOperation({ summary: "Obtener un torneo por ID" })
  async findOne(id: number) {
    const torneo = await this.prisma.torneos.findUnique({
      where: { id_torneo: id },
      include: { disciplinas: true },
    });

    if (!torneo) {
      throw new NotFoundException("Torneo no encontrado");
    }

    return this.toLegacyTorneo(torneo);
  }

  @ApiOperation({ summary: "Actualizar un torneo" })
  async update(id: number, updateTorneoDto: UpdateTorneoDto) {
    await this.findOne(id);
    const torneo = await this.prisma.torneos.update({
      where: { id_torneo: id },
      data: {
        ...(updateTorneoDto.nombre ? { nombre: updateTorneoDto.nombre } : {}),
        ...(updateTorneoDto.tipo ? { tipo_torneo: updateTorneoDto.tipo } : {}),
        ...(updateTorneoDto.estado
          ? { estado: this.toCloudEstado(updateTorneoDto.estado) }
          : {}),
        ...(updateTorneoDto.disciplina_id
          ? { id_disciplina: updateTorneoDto.disciplina_id }
          : {}),
        ...(updateTorneoDto.fecha_inicio
          ? { fecha_inicio: new Date(updateTorneoDto.fecha_inicio) }
          : {}),
        ...(updateTorneoDto.fecha_fin
          ? { fecha_fin: new Date(updateTorneoDto.fecha_fin) }
          : {}),
        ...(updateTorneoDto.imagen_url ? { imagen: updateTorneoDto.imagen_url } : {}),
      },
      include: { disciplinas: true },
    });
    return this.toLegacyTorneo(torneo);
  }

  @ApiOperation({ summary: "Eliminar un torneo" })
  async remove(id: number): Promise<void> {
    await this.prisma.estadisticas_partido_jugador.deleteMany({
      where: { partidos: { id_torneo: id } },
    });
    await this.prisma.galeria_multimedia.deleteMany({
      where: { partidos: { id_torneo: id } },
    });
    await this.prisma.partidos.deleteMany({ where: { id_torneo: id } });
    await this.prisma.equipos.deleteMany({ where: { id_torneo: id } });
    await this.prisma.torneos.delete({ where: { id_torneo: id } });
  }

  private toCloudEstado(estado?: string) {
    const estados: Record<string, string> = {
      planeado: "Planificado",
      en_curso: "En curso",
      finalizado: "Finalizado",
    };
    return estados[estado || ""] || estado || "Planificado";
  }

  private toLegacyEstado(estado?: string) {
    const estados: Record<string, string> = {
      Planificado: "planeado",
      "En curso": "en_curso",
      Finalizado: "finalizado",
    };
    return estados[estado || ""] || estado;
  }

  private toLegacyTorneo(torneo: any) {
    return {
      id: torneo.id_torneo,
      nombre: torneo.nombre,
      tipo: torneo.tipo_torneo,
      estado: this.toLegacyEstado(torneo.estado),
      disciplina_id: torneo.id_disciplina,
      fecha_inicio: torneo.fecha_inicio,
      fecha_fin: torneo.fecha_fin,
      imagen_url: torneo.imagen,
      gestion: torneo.gestion,
      disciplina: torneo.disciplinas
        ? {
            id: torneo.disciplinas.id_disciplina,
            nombre: torneo.disciplinas.nombre_disciplina,
          }
        : undefined,
    };
  }
}
