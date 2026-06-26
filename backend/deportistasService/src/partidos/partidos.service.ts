import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartidosService {
  constructor(private readonly prisma: PrismaService) {}

  async getResultadosRecientes() {
    const partidos = await this.prisma.partido.findMany({
      where: { estado: 'Finalizado' },
      include: {
        equipo_local: true,
        equipo_visitante: true,
        torneo: { include: { disciplina: true } },
      },
      orderBy: [{ fecha: 'desc' }, { hora_inicio: 'desc' }],
      take: 10,
    });

    return partidos.map((p) => ({
      id_partido: p.id_partido,
      fecha: p.fecha,
      hora_inicio: p.hora_inicio,
      goles_local: p.goles_local,
      goles_visitante: p.goles_visitante,
      estado: p.estado,
      fase_torneo: p.fase_torneo,
      equipo_local: p.equipo_local.nombre_equipo,
      equipo_visitante: p.equipo_visitante.nombre_equipo,
      torneo_nombre: p.torneo.nombre,
      disciplina: p.torneo.disciplina.nombre_disciplina,
    }));
  }

  async getFixturePorTorneo(idTorneo: number) {
    const partidos = await this.prisma.partido.findMany({
      where: { id_torneo: idTorneo, estado: 'Programado' },
      include: {
        equipo_local: true,
        equipo_visitante: true,
        espacio: true,
      },
      orderBy: [{ fecha: 'asc' }, { hora_inicio: 'asc' }],
    });

    return partidos.map((p) => ({
      id_partido: p.id_partido,
      fecha: p.fecha,
      hora_inicio: p.hora_inicio,
      hora_fin: p.hora_fin,
      fase_torneo: p.fase_torneo,
      estado: p.estado,
      equipo_local: p.equipo_local.nombre_equipo,
      equipo_visitante: p.equipo_visitante.nombre_equipo,
      espacio: p.espacio?.nombre_espacio || null,
    }));
  }

  async getResultadosGenerales() {
    return this.getResultadosRecientes(); // Misma estructura exacta que recientes
  }

  async getProximosPartidosGenerales() {
    const partidos = await this.prisma.partido.findMany({
      where: { estado: 'Programado' },
      include: {
        equipo_local: true,
        equipo_visitante: true,
        torneo: true,
        espacio: true,
      },
      orderBy: [{ fecha: 'asc' }, { hora_inicio: 'asc' }],
      take: 10,
    });

    return partidos.map((p) => ({
      id_partido: p.id_partido,
      fecha: p.fecha,
      hora_inicio: p.hora_inicio,
      fase_torneo: p.fase_torneo,
      estado: p.estado,
      equipo_local: p.equipo_local.nombre_equipo,
      equipo_visitante: p.equipo_visitante.nombre_equipo,
      torneo_nombre: p.torneo.nombre,
      espacio: p.espacio?.nombre_espacio || null,
    }));
  }

  async getTorneos() {
    return this.prisma.torneo.findMany({
      where: { estado: { in: ['Planificado', 'En Curso', 'Finalizado'] } },
      orderBy: { nombre: 'asc' },
      select: {
        id_torneo: true,
        nombre: true,
        id_disciplina: true,
      },
    });
  }

  async getTablaPosiciones(idTorneo: number, idDisciplina?: number) {
    const equipos = await this.prisma.equipo.findMany({
      where: { id_torneo: idTorneo },
    });

    const partidos = await this.prisma.partido.findMany({
      where: {
        id_torneo: idTorneo,
        estado: 'Finalizado',
        torneo: idDisciplina ? { id_disciplina: idDisciplina } : undefined,
      },
    });

    const tablaMap = new Map<number, any>();
    for (const eq of equipos) {
      tablaMap.set(eq.id_equipo, {
        id_equipo: eq.id_equipo,
        nombre_equipo: eq.nombre_equipo,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        pts: 0,
      });
    }

    for (const p of partidos) {
      const local = tablaMap.get(p.id_equipo_local);
      const visitante = tablaMap.get(p.id_equipo_visitante);

      if (local && visitante) {
        const gfL = p.goles_local ?? 0;
        const gcL = p.goles_visitante ?? 0;
        const gfV = p.goles_visitante ?? 0;
        const gcV = p.goles_local ?? 0;

        local.pj += 1;
        visitante.pj += 1;
        local.gf += gfL;
        local.gc += gcL;
        visitante.gf += gfV;
        visitante.gc += gcV;

        if (gfL > gcL) {
          local.pg += 1;
          local.pts += 3;
          visitante.pp += 1;
        } else if (gfL < gcL) {
          visitante.pg += 1;
          visitante.pts += 3;
          local.pp += 1;
        } else {
          local.pe += 1;
          local.pts += 1;
          visitante.pe += 1;
          visitante.pts += 1;
        }
      }
    }

    const result = Array.from(tablaMap.values()).map((t) => {
      t.dg = t.gf - t.gc;
      return t;
    });

    return result.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.nombre_equipo.localeCompare(b.nombre_equipo);
    });
  }

  async getPartidosPorTorneo(idTorneo: number, idDisciplina?: number) {
    const partidos = await this.prisma.partido.findMany({
      where: {
        id_torneo: idTorneo,
        torneo: idDisciplina ? { id_disciplina: idDisciplina } : undefined,
      },
      include: {
        equipo_local: true,
        equipo_visitante: true,
        torneo: { include: { disciplina: true } },
        espacio: true,
      },
      orderBy: [{ fecha: 'desc' }, { hora_inicio: 'desc' }],
    });

    return partidos.map((p) => ({
      id_partido: p.id_partido,
      fecha: p.fecha,
      hora_inicio: p.hora_inicio,
      goles_local: p.goles_local,
      goles_visitante: p.goles_visitante,
      estado: p.estado,
      fase_torneo: p.fase_torneo,
      equipo_local: p.equipo_local.nombre_equipo,
      equipo_visitante: p.equipo_visitante.nombre_equipo,
      espacio: p.espacio?.nombre_espacio || null,
      torneo_nombre: p.torneo.nombre,
      nombre_disciplina: p.torneo.disciplina.nombre_disciplina,
    }));
  }

  async getGoleadores(idTorneo: number, idDisciplina?: number) {
    const estadisticas = await this.prisma.estadisticaPartidoJugador.findMany({
      where: {
        partido: {
          id_torneo: idTorneo,
          torneo: idDisciplina ? { id_disciplina: idDisciplina } : undefined,
        },
        puntos_goles: { gt: 0 },
      },
      include: {
        deportista: {
          include: {
            persona: true,
            equipo_jugadores: { include: { equipo: true } },
          },
        },
      },
    });

    const goleadoresMap = new Map<number, any>();

    for (const est of estadisticas) {
      const depId = est.id_deportista;
      const equipoJugador = est.deportista.equipo_jugadores.find(
        (ej) => ej.equipo.id_torneo === idTorneo,
      );
      const equipoNombre = equipoJugador
        ? equipoJugador.equipo.nombre_equipo
        : 'Sin Equipo';

      if (!goleadoresMap.has(depId)) {
        goleadoresMap.set(depId, {
          id_deportista: depId,
          jugador: `${est.deportista.persona.nombres} ${est.deportista.persona.ape_paterno}`,
          equipo: equipoNombre,
          goles: 0,
        });
      }
      goleadoresMap.get(depId).goles += est.puntos_goles;
    }

    return Array.from(goleadoresMap.values())
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 20);
  }

  async getTarjetas(idTorneo: number, idDisciplina?: number) {
    const equipos = await this.prisma.equipo.findMany({
      where: {
        id_torneo: idTorneo,
        torneo: idDisciplina ? { id_disciplina: idDisciplina } : undefined,
      },
      include: {
        jugadores: {
          include: {
            deportista: {
              include: {
                estadisticas: {
                  where: { partido: { id_torneo: idTorneo } },
                },
              },
            },
          },
        },
      },
    });

    const result = equipos.map((eq) => {
      let amarillas = 0;
      let rojas = 0;

      for (const j of eq.jugadores) {
        for (const est of j.deportista.estadisticas) {
          amarillas += est.faltas_tarjetas_amarillas;
          rojas += est.faltas_tarjetas_rojas;
        }
      }

      return {
        id_equipo: eq.id_equipo,
        equipo: eq.nombre_equipo,
        amarillas,
        rojas,
      };
    });

    return result.sort((a, b) => {
      if (b.rojas !== a.rojas) return b.rojas - a.rojas;
      if (b.amarillas !== a.amarillas) return b.amarillas - a.amarillas;
      return a.equipo.localeCompare(b.equipo);
    });
  }

  async getDisciplinas() {
    return this.prisma.disciplina.findMany({
      where: { activo: true },
      orderBy: { nombre_disciplina: 'asc' },
      select: {
        id_disciplina: true,
        nombre_disciplina: true,
      },
    });
  }
}
