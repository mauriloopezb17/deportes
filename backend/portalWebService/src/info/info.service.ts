import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}

  async getEntrenadores() {
    const entrenadores = await this.prisma.entrenadores.findMany({
      include: {
        usuarios: { include: { personas: true } },
        entrenador_asignacion: {
          include: { disciplinas: true, categorias: true },
        },
      },
    });

    // Aplanamos la respuesta para que coincida con el antiguo JOIN de SQL
    const resultado = entrenadores.flatMap((e) =>
      e.entrenador_asignacion.map((ea) => ({
        id_entrenador: e.id_entrenador,
        nombres: e.usuarios?.personas?.nombres,
        ape_paterno: e.usuarios?.personas?.ape_paterno,
        ape_materno: e.usuarios?.personas?.ape_materno,
        url_foto: e.url_foto,
        nombre_disciplina: ea.disciplinas?.nombre_disciplina,
        nombre_categoria: ea.categorias?.nombre_categoria,
      })),
    );

    return resultado.sort((a, b) => a.nombres.localeCompare(b.nombres));
  }

  async getHorarios() {
    const horarios = await this.prisma.plantilla_horarios_fijos.findMany({
      where: {
        tipos_bloqueo: { nombre_bloqueo: 'Entrenamiento' },
      },
      include: {
        disciplinas: true,
        espacios: true,
        tipos_bloqueo: true,
        entrenadores: {
          include: {
            usuarios: { include: { personas: true } },
          },
        },
      },
      orderBy: [{ dia_semana: 'asc' }, { hora_inicio: 'asc' }],
    });

    return horarios.map((ph) => ({
      dia_semana: ph.dia_semana,
      hora_inicio: ph.hora_inicio,
      hora_fin: ph.hora_fin,
      nombre_disciplina: ph.disciplinas?.nombre_disciplina,
      nombre_espacio: ph.espacios?.nombre_espacio,
      nombre_bloqueo: ph.tipos_bloqueo?.nombre_bloqueo,
      entrenador_nombres: ph.entrenadores?.usuarios?.personas?.nombres || null,
      entrenador_apellido:
        ph.entrenadores?.usuarios?.personas?.ape_paterno || null,
    }));
  }

  async getGaleriaEventos() {
    return this.prisma.galeria_multimedia.findMany({
      where: { publicado: true },
      select: {
        id_multimedia: true,
        url_archivo: true,
        tipo_archivo: true,
        id_torneo: true,
        id_partido: true,
        fecha_subida: true,
      },
      orderBy: { fecha_subida: 'desc' },
    });
  }

  async getEspacios() {
    return this.prisma.espacios.findMany({
      where: { activo: true },
      select: {
        id_espacio: true,
        nombre_espacio: true,
        hora_apertura: true,
      },
      orderBy: { nombre_espacio: 'asc' },
    });
  }
}
