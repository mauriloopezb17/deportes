import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFixtureDto } from "./dto/create-fixture.dto";
import { GenerateFixtureDto } from "./dto/generate-fixture.dto";
import { UpdateFixtureDto } from "./dto/update-fixture.dto";

@ApiTags("Fixtures")
@Injectable()
export class FixtureService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Crear un nuevo partido" })
  async create(createFixtureDto: CreateFixtureDto) {
    const date = createFixtureDto.fecha_hora
      ? new Date(createFixtureDto.fecha_hora)
      : new Date();
    const endTime = new Date(date.getTime() + 60 * 60 * 1000);

    const partido = await this.prisma.partidos.create({
      data: {
        id_torneo: createFixtureDto.torneo_id,
        id_equipo_local: createFixtureDto.equipo_local_id,
        id_equipo_visitante: createFixtureDto.equipo_visitante_id,
        fase_torneo: `Ronda ${createFixtureDto.ronda}`,
        fecha: date,
        hora_inicio: date,
        hora_fin: endTime,
        goles_local: createFixtureDto.resultado_local || 0,
        goles_visitante: createFixtureDto.resultado_visitante || 0,
        estado: "Programado",
      },
      include: this.includeRelations(),
    });

    return this.toLegacyFixture(partido);
  }

  @ApiOperation({ summary: "Obtener todos los partidos" })
  async findAll() {
    const partidos = await this.prisma.partidos.findMany({
      include: this.includeRelations(),
      orderBy: { id_partido: "asc" },
    });
    return partidos.map((partido) => this.toLegacyFixture(partido));
  }

  @ApiOperation({ summary: "Obtener un partido por ID" })
  async findOne(id: number) {
    const partido = await this.prisma.partidos.findUnique({
      where: { id_partido: id },
      include: this.includeRelations(),
    });
    return partido ? this.toLegacyFixture(partido) : null;
  }

  @ApiOperation({ summary: "Obtener partidos de un torneo" })
  async findByTorneo(torneoId: number) {
    const partidos = await this.prisma.partidos.findMany({
      where: { id_torneo: torneoId },
      include: this.includeRelations(),
      orderBy: [{ fase_torneo: "asc" }, { id_partido: "asc" }],
    });
    return partidos.map((partido) => this.toLegacyFixture(partido));
  }

  @ApiOperation({ summary: "Generar fixture automatico" })
  async generate(generateFixtureDto: GenerateFixtureDto) {
    const torneo = await this.prisma.torneos.findUnique({
      where: { id_torneo: generateFixtureDto.torneo_id },
      include: { disciplinas: true, equipos: true },
    });

    if (!torneo) {
      throw new NotFoundException("Torneo no encontrado");
    }

    if (torneo.equipos.length < 2) {
      throw new BadRequestException(
        "Se necesitan al menos 2 equipos para generar el fixture",
      );
    }

    const durationMinutes = generateFixtureDto.duracion_minutos ?? 60;
    const dayStart = this.timeToMinutes(generateFixtureDto.hora_inicio ?? "08:00");
    const dayEnd = this.timeToMinutes(generateFixtureDto.hora_fin ?? "18:00");

    if (dayStart + durationMinutes > dayEnd) {
      throw new BadRequestException(
        "El rango horario no alcanza para programar un partido",
      );
    }

    const espacios = await this.resolveSpaces(
      generateFixtureDto.espacio_ids,
      torneo.id_disciplina,
      torneo.disciplinas?.nombre_disciplina,
    );
    const startDate = this.resolveStartDate(
      generateFixtureDto.fecha_inicio,
      torneo.fecha_inicio,
    );
    const rounds = this.buildRoundRobinRounds(
      torneo.equipos.map((equipo) => equipo.id_equipo),
    );

    if (generateFixtureDto.reemplazar_existente) {
      await this.deleteMatchDependencies({ id_torneo: torneo.id_torneo });
      await this.prisma.partidos.deleteMany({
        where: { id_torneo: torneo.id_torneo },
      });
    }

    const existingMatches = await this.prisma.partidos.findMany();
    const existingPairs = new Set(
      existingMatches
        .filter((partido) => partido.id_torneo === torneo.id_torneo)
        .map((partido) =>
          this.pairKey(partido.id_equipo_local, partido.id_equipo_visitante),
        ),
    );
    const busy = this.buildBusyIndex(existingMatches);
    const created: any[] = [];

    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
      for (const match of rounds[roundIndex]) {
        if (existingPairs.has(this.pairKey(match.localId, match.visitorId))) {
          continue;
        }

        const slot = this.findAvailableSlot({
          busy,
          startDate,
          dayStart,
          dayEnd,
          durationMinutes,
          espacios,
          roundIndex,
          localId: match.localId,
          visitorId: match.visitorId,
        });

        this.markBusy(
          busy,
          slot.date,
          slot.startMinutes,
          match.localId,
          match.visitorId,
          slot.spaceId,
          !slot.spaceId,
        );

        created.push({
          id_torneo: torneo.id_torneo,
          id_equipo_local: match.localId,
          id_equipo_visitante: match.visitorId,
          id_espacio: slot.spaceId,
          fase_torneo: `Ronda ${roundIndex + 1}`,
          fecha: slot.date,
          hora_inicio: this.dateWithMinutes(slot.date, slot.startMinutes),
          hora_fin: this.dateWithMinutes(
            slot.date,
            slot.startMinutes + durationMinutes,
          ),
          goles_local: 0,
          goles_visitante: 0,
          estado: "Programado",
        });
      }
    }

    await this.prisma.partidos.createMany({ data: created });

    const partidos = await this.prisma.partidos.findMany({
      where: { id_torneo: torneo.id_torneo },
      include: this.includeRelations(),
      orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }, { id_partido: "asc" }],
    });

    return partidos.map((partido) => this.toLegacyFixture(partido));
  }

  @ApiOperation({ summary: "Actualizar un partido" })
  async update(id: number, updateFixtureDto: UpdateFixtureDto) {
    const date = updateFixtureDto.fecha_hora
      ? new Date(updateFixtureDto.fecha_hora)
      : undefined;

    const partido = await this.prisma.partidos.update({
      where: { id_partido: id },
      data: {
        ...(updateFixtureDto.torneo_id
          ? { id_torneo: updateFixtureDto.torneo_id }
          : {}),
        ...(updateFixtureDto.equipo_local_id
          ? { id_equipo_local: updateFixtureDto.equipo_local_id }
          : {}),
        ...(updateFixtureDto.equipo_visitante_id
          ? { id_equipo_visitante: updateFixtureDto.equipo_visitante_id }
          : {}),
        ...(updateFixtureDto.ronda
          ? { fase_torneo: `Ronda ${updateFixtureDto.ronda}` }
          : {}),
        ...(date
          ? {
              fecha: date,
              hora_inicio: date,
              hora_fin: new Date(date.getTime() + 60 * 60 * 1000),
            }
          : {}),
        ...(updateFixtureDto.resultado_local !== undefined
          ? { goles_local: updateFixtureDto.resultado_local }
          : {}),
        ...(updateFixtureDto.resultado_visitante !== undefined
          ? { goles_visitante: updateFixtureDto.resultado_visitante }
          : {}),
      },
      include: this.includeRelations(),
    });

    return this.toLegacyFixture(partido);
  }

  @ApiOperation({ summary: "Eliminar un partido" })
  async remove(id: number): Promise<void> {
    await this.deleteMatchDependencies({ id_partido: id });
    await this.prisma.partidos.delete({ where: { id_partido: id } });
  }

  private includeRelations() {
    return {
      equipos_partidos_id_equipo_localToequipos: true,
      equipos_partidos_id_equipo_visitanteToequipos: true,
      espacios: true,
    };
  }

  private async deleteMatchDependencies(matchWhere: any) {
    await this.prisma.estadisticas_partido_jugador.deleteMany({
      where: { partidos: matchWhere },
    });
    await this.prisma.galeria_multimedia.deleteMany({
      where: { partidos: matchWhere },
    });
  }

  private async resolveSpaces(
    spaceIds?: number[],
    disciplineId?: number | null,
    disciplineName?: string,
  ) {
    const where =
      spaceIds && spaceIds.length > 0
        ? { id_espacio: { in: spaceIds }, activo: true }
        : { activo: true };
    const espacios = await this.prisma.espacios.findMany({
      where,
      orderBy: { id_espacio: "asc" },
    });

    if (spaceIds?.length && espacios.length !== spaceIds.length) {
      throw new BadRequestException("Uno o mas espacios no existen o no estan activos");
    }

    if (spaceIds?.length || espacios.length <= 1) {
      return espacios.map((espacio) => espacio.id_espacio);
    }

    const configuredSpaces = await this.findConfiguredSpacesForDiscipline(
      disciplineId,
      espacios.map((espacio) => espacio.id_espacio),
    );

    if (configuredSpaces.length > 0) {
      return configuredSpaces;
    }

    const compatibleSpaces = this.findSpacesBySportGroup(espacios, disciplineName);

    if (compatibleSpaces.length > 0) {
      return compatibleSpaces;
    }

    return espacios.map((espacio) => espacio.id_espacio);
  }

  private async findConfiguredSpacesForDiscipline(
    disciplineId?: number | null,
    activeSpaceIds: number[] = [],
  ) {
    if (!disciplineId) {
      return [];
    }

    const templates = await this.prisma.plantilla_horarios_fijos.findMany({
      where: {
        id_disciplina: disciplineId,
        id_espacio: { in: activeSpaceIds },
      },
      distinct: ["id_espacio"],
      orderBy: { id_espacio: "asc" },
    });

    return templates.map((template) => template.id_espacio);
  }

  private findSpacesBySportGroup(
    espacios: Array<{ id_espacio: number; nombre_espacio: string }>,
    disciplineName?: string,
  ) {
    const group = this.getSportSpaceGroup(disciplineName);

    if (!group) {
      return [];
    }

    const normalizedSpaces = espacios.map((espacio, index) => ({
      id: espacio.id_espacio,
      index,
      name: this.normalizeText(espacio.nombre_espacio),
    }));

    const footballMatches = normalizedSpaces.filter((space) =>
      ["futbol", "futsal", "principal", "cesped", "sintetica"].some((term) =>
        space.name.includes(term),
      ),
    );
    const sharedCourtMatches = normalizedSpaces.filter((space) =>
      ["voley", "volley", "basquet", "basket", "polifuncional", "coliseo"].some(
        (term) => space.name.includes(term),
      ),
    );

    if (group === "football") {
      return this.spaceIdsOrFallback(footballMatches, normalizedSpaces, 0);
    }

    return this.spaceIdsOrFallback(sharedCourtMatches, normalizedSpaces, 1);
  }

  private getSportSpaceGroup(disciplineName?: string) {
    const discipline = this.normalizeText(disciplineName || "");

    if (["futbol", "futsal"].some((term) => discipline.includes(term))) {
      return "football";
    }

    if (
      ["voley", "volley", "basquet", "basket"].some((term) =>
        discipline.includes(term),
      )
    ) {
      return "shared-court";
    }

    return undefined;
  }

  private spaceIdsOrFallback(
    matches: Array<{ id: number; index: number; name: string }>,
    spaces: Array<{ id: number; index: number; name: string }>,
    fallbackIndex: number,
  ) {
    if (matches.length > 0) {
      return matches.map((space) => space.id);
    }

    return spaces[fallbackIndex] ? [spaces[fallbackIndex].id] : [];
  }

  private buildRoundRobinRounds(teamIds: number[]) {
    const teams = this.shuffle([...teamIds]);
    const bye = -1;

    if (teams.length % 2 !== 0) {
      teams.push(bye);
    }

    const rounds: Array<Array<{ localId: number; visitorId: number }>> = [];
    const totalRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;

    for (let round = 0; round < totalRounds; round += 1) {
      const matches: Array<{ localId: number; visitorId: number }> = [];

      for (let index = 0; index < matchesPerRound; index += 1) {
        const first = teams[index];
        const second = teams[teams.length - 1 - index];

        if (first !== bye && second !== bye) {
          const swapHome = Math.random() > 0.5;
          matches.push({
            localId: swapHome ? second : first,
            visitorId: swapHome ? first : second,
          });
        }
      }

      rounds.push(this.shuffle(matches));
      teams.splice(1, 0, teams.pop()!);
    }

    return rounds;
  }

  private shuffle<T>(items: T[]) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
    return items;
  }

  private buildBusyIndex(partidos: any[]) {
    const busy = {
      teams: new Set<string>(),
      spaces: new Set<string>(),
      global: new Set<string>(),
    };

    partidos.forEach((partido) => {
      const startMinutes = this.dateToMinutes(partido.hora_inicio);
      this.markBusy(
        busy,
        partido.fecha,
        startMinutes,
        partido.id_equipo_local,
        partido.id_equipo_visitante,
        partido.id_espacio,
        !partido.id_espacio,
      );
    });

    return busy;
  }

  private findAvailableSlot(params: {
    busy: { teams: Set<string>; spaces: Set<string>; global: Set<string> };
    startDate: Date;
    dayStart: number;
    dayEnd: number;
    durationMinutes: number;
    espacios: number[];
    roundIndex: number;
    localId: number;
    visitorId: number;
  }) {
    const spaces = params.espacios.length > 0 ? params.espacios : [undefined];
    const maxDaysToSearch = 365;

    for (let dayOffset = params.roundIndex; dayOffset < maxDaysToSearch; dayOffset += 1) {
      const date = this.addDays(params.startDate, dayOffset);

      for (
        let startMinutes = params.dayStart;
        startMinutes + params.durationMinutes <= params.dayEnd;
        startMinutes += params.durationMinutes
      ) {
        for (const spaceId of spaces) {
          if (
            this.isSlotAvailable(
              params.busy,
              date,
              startMinutes,
              params.localId,
              params.visitorId,
              spaceId,
            )
          ) {
            return { date, startMinutes, spaceId };
          }
        }
      }
    }

    throw new BadRequestException(
      "No hay horarios disponibles para generar todo el fixture",
    );
  }

  private isSlotAvailable(
    busy: { teams: Set<string>; spaces: Set<string>; global: Set<string> },
    date: Date,
    startMinutes: number,
    localId: number,
    visitorId: number,
    spaceId?: number,
  ) {
    const slotKey = this.slotKey(date, startMinutes);

    if (busy.teams.has(`${localId}:${slotKey}`)) return false;
    if (busy.teams.has(`${visitorId}:${slotKey}`)) return false;
    if (!spaceId && busy.global.has(slotKey)) return false;
    if (spaceId && busy.spaces.has(`${spaceId}:${slotKey}`)) return false;

    return true;
  }

  private markBusy(
    busy: { teams: Set<string>; spaces: Set<string>; global: Set<string> },
    date: Date,
    startMinutes: number,
    localId: number,
    visitorId: number,
    spaceId?: number,
    globalSlot = false,
  ) {
    const slotKey = this.slotKey(date, startMinutes);
    busy.teams.add(`${localId}:${slotKey}`);
    busy.teams.add(`${visitorId}:${slotKey}`);

    if (spaceId) {
      busy.spaces.add(`${spaceId}:${slotKey}`);
    }

    if (globalSlot) {
      busy.global.add(slotKey);
    }
  }

  private resolveStartDate(fechaInicio?: string, torneoStartDate?: Date | null) {
    if (fechaInicio) {
      return this.onlyDate(new Date(fechaInicio));
    }
    if (torneoStartDate) {
      return this.onlyDate(torneoStartDate);
    }
    return this.onlyDate(new Date());
  }

  private timeToMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private dateToMinutes(date: Date) {
    const value = new Date(date);
    return value.getHours() * 60 + value.getMinutes();
  }

  private dateWithMinutes(date: Date, minutes: number) {
    const value = this.onlyDate(date);
    value.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return value;
  }

  private addDays(date: Date, days: number) {
    const value = this.onlyDate(date);
    value.setDate(value.getDate() + days);
    return value;
  }

  private onlyDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private slotKey(date: Date, startMinutes: number) {
    const day = this.onlyDate(date).toISOString().slice(0, 10);
    return `${day}:${startMinutes}`;
  }

  private pairKey(firstTeamId: number, secondTeamId: number) {
    return [firstTeamId, secondTeamId].sort((a, b) => a - b).join(":");
  }

  private normalizeText(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  private toLegacyFixture(partido: any) {
    return {
      id: partido.id_partido,
      torneo_id: partido.id_torneo,
      ronda: this.parseRonda(partido.fase_torneo),
      equipo_local_id: partido.id_equipo_local,
      equipo_visitante_id: partido.id_equipo_visitante,
      fecha_hora: this.combineDateAndTime(partido.fecha, partido.hora_inicio),
      estadio: partido.espacios?.nombre_espacio,
      resultado_local: partido.goles_local,
      resultado_visitante: partido.goles_visitante,
      next_match_id: undefined,
      estado: partido.estado,
      equipoLocal: partido.equipos_partidos_id_equipo_localToequipos
        ? {
            id: partido.equipos_partidos_id_equipo_localToequipos.id_equipo,
            nombre_equipo:
              partido.equipos_partidos_id_equipo_localToequipos.nombre_equipo,
          }
        : undefined,
      equipoVisitante: partido.equipos_partidos_id_equipo_visitanteToequipos
        ? {
            id: partido.equipos_partidos_id_equipo_visitanteToequipos.id_equipo,
            nombre_equipo:
              partido.equipos_partidos_id_equipo_visitanteToequipos.nombre_equipo,
          }
        : undefined,
    };
  }

  private parseRonda(fase?: string): number {
    const match = String(fase || "").match(/\d+/);
    return match ? Number(match[0]) : 1;
  }

  private combineDateAndTime(date?: Date, time?: Date) {
    if (!date) {
      return undefined;
    }

    const combined = new Date(date);
    if (time) {
      const timeDate = new Date(time);
      combined.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
    }
    return combined;
  }
}
