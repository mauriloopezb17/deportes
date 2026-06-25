import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEquipoDto } from "./dto/create-equipo.dto";
import { UpdateEquipoDto } from "./dto/update-equipo.dto";

@ApiTags("Equipos")
@Injectable()
export class EquipoService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Crear un nuevo equipo" })
  async create(createEquipoDto: CreateEquipoDto, currentUser?: any) {
    const carreraId = this.resolveCarreraId(createEquipoDto.carrera_id, currentUser);
    await this.ensureEquipoDisponible(carreraId, createEquipoDto.disciplina_id);

    const torneo = await this.findTorneoForEquipo(createEquipoDto.disciplina_id);
    const responsable = await this.prisma.personas.findFirst({
      orderBy: { id_persona: "asc" },
    });

    if (!responsable) {
      throw new BadRequestException(
        "No existe una persona para asignar como responsable del equipo",
      );
    }

    const equipo = await this.prisma.equipos.create({
      data: {
        id_torneo: torneo.id_torneo,
        id_persona: responsable.id_persona,
        id_carrera: carreraId,
        nombre_equipo: createEquipoDto.nombre_equipo,
      },
      include: this.includeRelations(),
    });

    return this.toLegacyEquipo(equipo);
  }

  @ApiOperation({ summary: "Obtener todos los equipos" })
  async findAll() {
    const equipos = await this.prisma.equipos.findMany({
      include: this.includeRelations(),
      orderBy: { id_equipo: "asc" },
    });
    return equipos.map((equipo) => this.toLegacyEquipo(equipo));
  }

  @ApiOperation({ summary: "Obtener un equipo por ID" })
  async findOne(id: number) {
    const equipo = await this.prisma.equipos.findUnique({
      where: { id_equipo: id },
      include: {
        ...this.includeRelations(),
        equipo_jugadores: true,
      },
    });
    return equipo ? this.toLegacyEquipo(equipo) : null;
  }

  @ApiOperation({ summary: "Obtener equipos por carrera y disciplina" })
  async findByCarreraAndDisciplina(carreraId: number, disciplinaId: number) {
    const equipo = await this.prisma.equipos.findFirst({
      where: {
        id_carrera: carreraId,
        torneos: { id_disciplina: disciplinaId },
      },
      include: this.includeRelations(),
    });
    return equipo ? this.toLegacyEquipo(equipo) : null;
  }

  @ApiOperation({ summary: "Actualizar un equipo" })
  async update(id: number, updateEquipoDto: UpdateEquipoDto, currentUser?: any) {
    const currentEquipo = await this.prisma.equipos.findUnique({
      where: { id_equipo: id },
      include: { torneos: true },
    });

    if (!currentEquipo) {
      throw new BadRequestException("Equipo no encontrado");
    }

    const disciplinaId =
      updateEquipoDto.disciplina_id ?? currentEquipo.torneos?.id_disciplina;
    const carreraId = this.resolveCarreraId(
      updateEquipoDto.carrera_id ?? currentEquipo.id_carrera,
      currentUser,
    );

    if (disciplinaId) {
      await this.ensureEquipoDisponible(carreraId, disciplinaId, id);
    }

    const torneo = updateEquipoDto.disciplina_id
      ? await this.findTorneoForEquipo(updateEquipoDto.disciplina_id)
      : null;

    const equipo = await this.prisma.equipos.update({
      where: { id_equipo: id },
      data: {
        ...(updateEquipoDto.nombre_equipo
          ? { nombre_equipo: updateEquipoDto.nombre_equipo }
          : {}),
        id_carrera: carreraId,
        ...(torneo ? { id_torneo: torneo.id_torneo } : {}),
      },
      include: this.includeRelations(),
    });
    return this.toLegacyEquipo(equipo);
  }

  private resolveCarreraId(requestedCarreraId: number, currentUser?: any) {
    const isDelegado = currentUser?.roles?.includes("DELEGADO");

    if (!isDelegado) {
      return requestedCarreraId;
    }

    const delegadoCarreraId = Number(currentUser.carrera_id);
    if (!delegadoCarreraId) {
      throw new ForbiddenException("El delegado no tiene una carrera asignada");
    }

    if (requestedCarreraId && requestedCarreraId !== delegadoCarreraId) {
      throw new ForbiddenException(
        "Solo puedes gestionar equipos de tu propia carrera",
      );
    }

    return delegadoCarreraId;
  }

  private async ensureEquipoDisponible(
    carreraId: number,
    disciplinaId: number,
    excludeEquipoId?: number,
  ) {
    const existing = await this.prisma.equipos.findFirst({
      where: {
        id_carrera: carreraId,
        torneos: { id_disciplina: disciplinaId },
        ...(excludeEquipoId ? { id_equipo: { not: excludeEquipoId } } : {}),
      },
    });

    if (existing) {
      throw new BadRequestException(
        "Ya existe un equipo para esta carrera y disciplina",
      );
    }
  }

  @ApiOperation({ summary: "Eliminar un equipo" })
  async remove(id: number): Promise<void> {
    const matchWhere = {
      OR: [{ id_equipo_local: id }, { id_equipo_visitante: id }],
    };

    await this.prisma.estadisticas_partido_jugador.deleteMany({
      where: { partidos: matchWhere },
    });
    await this.prisma.galeria_multimedia.deleteMany({
      where: { partidos: matchWhere },
    });
    await this.prisma.equipo_jugadores.deleteMany({ where: { id_equipo: id } });
    await this.prisma.partidos.deleteMany({ where: matchWhere });
    await this.prisma.equipos.delete({ where: { id_equipo: id } });
  }

  private async findTorneoForEquipo(disciplinaId: number) {
    const torneo = await this.prisma.torneos.findFirst({
      where: { id_disciplina: disciplinaId },
      orderBy: { id_torneo: "desc" },
    });

    if (torneo) {
      return torneo;
    }

    return this.prisma.torneos.create({
      data: {
        id_disciplina: disciplinaId,
        nombre: "Torneo general",
        tipo_torneo: "Interno",
        gestion: new Date().getFullYear(),
        estado: "Planificado",
      },
    });
  }

  private includeRelations() {
    return {
      carreras: true,
      torneos: { include: { disciplinas: true } },
      personas: true,
    };
  }

  private toLegacyEquipo(equipo: any) {
    return {
      id: equipo.id_equipo,
      nombre_equipo: equipo.nombre_equipo,
      carrera_id: equipo.id_carrera,
      disciplina_id: equipo.torneos?.id_disciplina,
      torneo_id: equipo.id_torneo,
      persona_id: equipo.id_persona,
      grupo: equipo.grupo,
      carrera: equipo.carreras
        ? { id: equipo.carreras.id_carrera, nombre: equipo.carreras.nombre }
        : undefined,
      disciplina: equipo.torneos?.disciplinas
        ? {
            id: equipo.torneos.disciplinas.id_disciplina,
            nombre: equipo.torneos.disciplinas.nombre_disciplina,
          }
        : undefined,
      jugadores: equipo.equipo_jugadores || [],
    };
  }
}
