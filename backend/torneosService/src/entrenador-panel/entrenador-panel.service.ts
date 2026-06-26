import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { RegistrarPartidoEntrenadorDto } from "./dto/registrar-partido-entrenador.dto";

@ApiTags("Panel Entrenador")
@Injectable()
export class EntrenadorPanelService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Obtener resumen del entrenador" })
  async getResumen(usuarioId: number) {
    const context = await this.getTrainerContext(usuarioId);

    return {
      entrenador_id: context.entrenador.id_entrenador,
      disciplina: context.disciplina
        ? {
            id: context.disciplina.id_disciplina,
            nombre: context.disciplina.nombre_disciplina,
          }
        : null,
      categorias: context.asignaciones.map((asignacion) => ({
        id: asignacion.categorias.id_categoria,
        nombre: asignacion.categorias.nombre_categoria,
      })),
    };
  }

  @ApiOperation({ summary: "Listar partidos pendientes del entrenador" })
  async getPartidosPendientes(usuarioId: number) {
    const context = await this.getTrainerContext(usuarioId);
    const disciplineId = this.requireDiscipline(context);

    const partidos = await this.prisma.partidos.findMany({
      where: {
        torneos: { id_disciplina: disciplineId },
        estado: { not: "Finalizado" },
      },
      include: this.matchInclude(),
      orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
    });

    return partidos.map((partido) => this.toLegacyPartido(partido));
  }

  @ApiOperation({ summary: "Obtener detalle de partido para registro" })
  async getPartido(usuarioId: number, partidoId: number) {
    const context = await this.getTrainerContext(usuarioId);
    const partido = await this.getAuthorizedMatch(context, partidoId);
    return this.toLegacyPartidoDetalle(partido);
  }

  @ApiOperation({ summary: "Registrar resultado y estadisticas del partido" })
  async registrarPartido(
    usuarioId: number,
    partidoId: number,
    data: RegistrarPartidoEntrenadorDto,
  ) {
    const context = await this.getTrainerContext(usuarioId);
    const partido = await this.getAuthorizedMatch(context, partidoId);
    const disciplineName =
      partido.torneos.disciplinas?.nombre_disciplina?.toLowerCase() || "";
    const shouldRecordScorers =
      disciplineName.includes("fut") || disciplineName.includes("básquet") || disciplineName.includes("basquet");

    await this.prisma.$transaction(async (tx) => {
      await tx.estadisticas_partido_jugador.deleteMany({
        where: { id_partido: partidoId },
      });

      const estadisticas = (data.estadisticas || []).filter(
        (item) =>
          (item.puntos_goles || 0) > 0 ||
          (item.faltas_tarjetas_amarillas || 0) > 0 ||
          (item.faltas_tarjetas_rojas || 0) > 0,
      );

      if (estadisticas.length > 0) {
        await tx.estadisticas_partido_jugador.createMany({
          data: estadisticas.map((item) => ({
            id_partido: partidoId,
            id_deportista: item.id_deportista,
            puntos_goles: shouldRecordScorers ? item.puntos_goles || 0 : 0,
            faltas_tarjetas_amarillas: item.faltas_tarjetas_amarillas || 0,
            faltas_tarjetas_rojas: item.faltas_tarjetas_rojas || 0,
          })),
        });
      }

      await tx.partidos.update({
        where: { id_partido: partidoId },
        data: {
          goles_local: data.resultado_local,
          goles_visitante: data.resultado_visitante,
          estado: "Finalizado",
        },
      });
    });

    const updated = await this.prisma.partidos.findUnique({
      where: { id_partido: partidoId },
      include: this.matchDetailInclude(),
    });

    return this.toLegacyPartidoDetalle(updated);
  }

  private async getTrainerContext(usuarioId: number) {
    const entrenador = await this.prisma.entrenadores.findFirst({
      where: { id_usuario: usuarioId },
      include: {
        entrenador_asignacion: {
          include: { categorias: true, disciplinas: true },
          orderBy: { id_asignacion: "asc" },
        },
      },
    });

    if (!entrenador) {
      throw new NotFoundException("No existe un entrenador vinculado a este usuario");
    }

    const disciplineIds = [
      ...new Set(
        entrenador.entrenador_asignacion.map(
          (asignacion) => asignacion.id_disciplina,
        ),
      ),
    ];

    if (disciplineIds.length > 1) {
      throw new BadRequestException(
        "Un entrenador no puede tener mas de una disciplina asignada",
      );
    }

    return {
      entrenador,
      asignaciones: entrenador.entrenador_asignacion,
      disciplina: entrenador.entrenador_asignacion[0]?.disciplinas,
    };
  }

  private requireDiscipline(context: any) {
    const disciplineId = context.disciplina?.id_disciplina;

    if (!disciplineId) {
      throw new BadRequestException("El entrenador no tiene disciplina asignada");
    }

    return disciplineId;
  }

  private async getAuthorizedMatch(context: any, partidoId: number) {
    const disciplineId = this.requireDiscipline(context);
    const partido = await this.prisma.partidos.findUnique({
      where: { id_partido: partidoId },
      include: this.matchDetailInclude(),
    });

    if (!partido) {
      throw new NotFoundException("Partido no encontrado");
    }

    if (partido.torneos.id_disciplina !== disciplineId) {
      throw new ForbiddenException("El partido no pertenece a la disciplina del entrenador");
    }

    return partido;
  }

  private matchInclude() {
    return {
      torneos: { include: { disciplinas: true } },
      equipos_partidos_id_equipo_localToequipos: true,
      equipos_partidos_id_equipo_visitanteToequipos: true,
      espacios: true,
    };
  }

  private matchDetailInclude() {
    return {
      ...this.matchInclude(),
      estadisticas_partido_jugador: true,
      equipos_partidos_id_equipo_localToequipos: {
        include: { equipo_jugadores: { include: this.playerInclude() } },
      },
      equipos_partidos_id_equipo_visitanteToequipos: {
        include: { equipo_jugadores: { include: this.playerInclude() } },
      },
    };
  }

  private playerInclude() {
    return {
      deportistas: {
        include: { personas_deportistas_id_personaTopersonas: true },
      },
    };
  }

  private toLegacyPartido(partido: any) {
    return {
      id: partido.id_partido,
      torneo_id: partido.id_torneo,
      disciplina: partido.torneos?.disciplinas
        ? {
            id: partido.torneos.disciplinas.id_disciplina,
            nombre: partido.torneos.disciplinas.nombre_disciplina,
          }
        : undefined,
      equipo_local: this.toEquipo(partido.equipos_partidos_id_equipo_localToequipos),
      equipo_visitante: this.toEquipo(
        partido.equipos_partidos_id_equipo_visitanteToequipos,
      ),
      fecha: partido.fecha,
      hora: partido.hora_inicio,
      cancha: partido.espacios
        ? { id: partido.espacios.id_espacio, nombre: partido.espacios.nombre_espacio }
        : undefined,
      estado: partido.estado,
      resultado_local: partido.goles_local,
      resultado_visitante: partido.goles_visitante,
    };
  }

  private toLegacyPartidoDetalle(partido: any) {
    return {
      ...this.toLegacyPartido(partido),
      permite_anotadores: this.allowsScorers(
        partido.torneos?.disciplinas?.nombre_disciplina,
      ),
      jugadores_local: this.toJugadores(
        partido.equipos_partidos_id_equipo_localToequipos?.equipo_jugadores,
        partido.estadisticas_partido_jugador,
      ),
      jugadores_visitante: this.toJugadores(
        partido.equipos_partidos_id_equipo_visitanteToequipos?.equipo_jugadores,
        partido.estadisticas_partido_jugador,
      ),
    };
  }

  private allowsScorers(disciplineName?: string) {
    const value = (disciplineName || "").toLowerCase();
    return value.includes("fut") || value.includes("básquet") || value.includes("basquet");
  }

  private toEquipo(equipo: any) {
    return equipo
      ? { id: equipo.id_equipo, nombre: equipo.nombre_equipo }
      : undefined;
  }

  private toJugadores(equipoJugadores: any[] = [], stats: any[] = []) {
    return equipoJugadores.map((relacion) => {
      const persona =
        relacion.deportistas?.personas_deportistas_id_personaTopersonas;
      const stat = stats.find(
        (item) => item.id_deportista === relacion.id_deportista,
      );

      return {
        id_deportista: relacion.id_deportista,
        nombre: [persona?.nombres, persona?.ape_paterno, persona?.ape_materno]
          .filter(Boolean)
          .join(" ")
          .trim(),
        puntos_goles: stat?.puntos_goles || 0,
        faltas_tarjetas_amarillas: stat?.faltas_tarjetas_amarillas || 0,
        faltas_tarjetas_rojas: stat?.faltas_tarjetas_rojas || 0,
      };
    });
  }
}
