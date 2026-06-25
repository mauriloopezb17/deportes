import { BadRequestException, Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJugadorEquipoDto } from "./dto/create-jugador-equipo.dto";

@ApiTags("Jugadores-Equipos")
@Injectable()
export class JugadorEquipoService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Agregar un jugador a un equipo" })
  async create(createJugadorEquipoDto: CreateJugadorEquipoDto) {
    const deportista = await this.findOrCreateDeportista(
      createJugadorEquipoDto.jugador_id,
    );
    const newEquipo = await this.prisma.equipos.findUnique({
      where: { id_equipo: createJugadorEquipoDto.equipo_id },
    });

    if (!newEquipo) {
      throw new BadRequestException("Equipo no encontrado");
    }

    const existing = await this.prisma.equipo_jugadores.findFirst({
      where: { id_deportista: deportista.id_deportista },
      include: { equipos: true },
    });

    if (existing?.equipos && newEquipo.id_carrera !== existing.equipos.id_carrera) {
      throw new BadRequestException(
        "Un jugador no puede participar en equipos de diferentes carreras",
      );
    }

    const jugadorEquipo = await this.prisma.equipo_jugadores.create({
      data: {
        id_deportista: deportista.id_deportista,
        id_equipo: createJugadorEquipoDto.equipo_id,
        habilitado: true,
      },
      include: this.includeRelations(),
    });

    return this.toLegacyJugadorEquipo(jugadorEquipo);
  }

  @ApiOperation({ summary: "Obtener todos los jugadores-equipos" })
  async findAll() {
    const jugadores = await this.prisma.equipo_jugadores.findMany({
      include: this.includeRelations(),
      orderBy: { id_equipo_jugador: "asc" },
    });
    return jugadores.map((jugador) => this.toLegacyJugadorEquipo(jugador));
  }

  @ApiOperation({ summary: "Obtener jugadores de un equipo" })
  async findByEquipo(equipoId: number) {
    const jugadores = await this.prisma.equipo_jugadores.findMany({
      where: { id_equipo: equipoId },
      include: this.includeRelations(),
      orderBy: { id_equipo_jugador: "asc" },
    });
    return jugadores.map((jugador) => this.toLegacyJugadorEquipo(jugador));
  }

  @ApiOperation({ summary: "Obtener equipos de un jugador" })
  async findByJugador(jugadorId: number) {
    const deportista = await this.prisma.deportistas.findFirst({
      where: { id_persona: jugadorId },
    });

    if (!deportista) {
      return [];
    }

    const jugadores = await this.prisma.equipo_jugadores.findMany({
      where: { id_deportista: deportista.id_deportista },
      include: this.includeRelations(),
      orderBy: { id_equipo_jugador: "asc" },
    });
    return jugadores.map((jugador) => this.toLegacyJugadorEquipo(jugador));
  }

  @ApiOperation({ summary: "Eliminar un jugador de un equipo" })
  async remove(jugadorId: number, equipoId: number): Promise<void> {
    const deportista = await this.prisma.deportistas.findFirst({
      where: { id_persona: jugadorId },
    });

    if (!deportista) {
      return;
    }

    await this.prisma.equipo_jugadores.deleteMany({
      where: { id_deportista: deportista.id_deportista, id_equipo: equipoId },
    });
  }

  private async findOrCreateDeportista(personaId: number) {
    const existing = await this.prisma.deportistas.findFirst({
      where: { id_persona: personaId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.deportistas.create({
      data: {
        id_persona: personaId,
        tipo_deportista: "UCB",
      },
    });
  }

  private includeRelations() {
    return {
      deportistas: { include: { personas_deportistas_id_personaTopersonas: true } },
      equipos: {
        include: {
          carreras: true,
          torneos: { include: { disciplinas: true } },
        },
      },
    };
  }

  private toLegacyJugadorEquipo(jugadorEquipo: any) {
    const persona =
      jugadorEquipo.deportistas?.personas_deportistas_id_personaTopersonas;
    const equipo = jugadorEquipo.equipos;

    return {
      jugador_id: jugadorEquipo.deportistas?.id_persona,
      equipo_id: jugadorEquipo.id_equipo,
      id_equipo_jugador: jugadorEquipo.id_equipo_jugador,
      habilitado: jugadorEquipo.habilitado,
      jugador: persona
        ? {
            id: persona.id_persona,
            nombre: persona.nombres,
            apellido: [persona.ape_paterno, persona.ape_materno]
              .filter(Boolean)
              .join(" ")
              .trim(),
            carnet: String(persona.ci),
          }
        : undefined,
      equipo: equipo
        ? {
            id: equipo.id_equipo,
            nombre_equipo: equipo.nombre_equipo,
            carrera_id: equipo.id_carrera,
            disciplina_id: equipo.torneos?.id_disciplina,
            carrera: equipo.carreras
              ? { id: equipo.carreras.id_carrera, nombre: equipo.carreras.nombre }
              : undefined,
            disciplina: equipo.torneos?.disciplinas
              ? {
                  id: equipo.torneos.disciplinas.id_disciplina,
                  nombre: equipo.torneos.disciplinas.nombre_disciplina,
                }
              : undefined,
          }
        : undefined,
    };
  }
}
