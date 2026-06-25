import { Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTorneoEquipoDto } from "./dto/create-torneo-equipo.dto";

@ApiTags("Torneo-Equipos")
@Injectable()
export class TorneoEquipoService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Agregar equipo a torneo" })
  async create(createTorneoEquipoDto: CreateTorneoEquipoDto) {
    const equipo = await this.prisma.equipos.update({
      where: { id_equipo: createTorneoEquipoDto.equipo_id },
      data: { id_torneo: createTorneoEquipoDto.torneo_id },
      include: { torneos: true },
    });
    return this.toLegacyTorneoEquipo(equipo);
  }

  @ApiOperation({ summary: "Obtener todos los equipos por torneo" })
  async findAll() {
    const equipos = await this.prisma.equipos.findMany({
      include: { torneos: true },
      orderBy: { id_equipo: "asc" },
    });
    return equipos.map((equipo) => this.toLegacyTorneoEquipo(equipo));
  }

  @ApiOperation({ summary: "Obtener equipos de un torneo" })
  async findByTorneo(torneoId: number) {
    const equipos = await this.prisma.equipos.findMany({
      where: { id_torneo: torneoId },
      include: { torneos: true },
      orderBy: { id_equipo: "asc" },
    });
    return equipos.map((equipo) => this.toLegacyTorneoEquipo(equipo));
  }

  @ApiOperation({ summary: "Eliminar equipo de torneo" })
  async remove(torneoId: number, equipoId: number): Promise<void> {
    await this.prisma.equipos.deleteMany({
      where: { id_torneo: torneoId, id_equipo: equipoId },
    });
  }

  private toLegacyTorneoEquipo(equipo: any) {
    return {
      torneo_id: equipo.id_torneo,
      equipo_id: equipo.id_equipo,
      torneo: equipo.torneos
        ? { id: equipo.torneos.id_torneo, nombre: equipo.torneos.nombre }
        : undefined,
      equipo: {
        id: equipo.id_equipo,
        nombre_equipo: equipo.nombre_equipo,
      },
    };
  }
}
