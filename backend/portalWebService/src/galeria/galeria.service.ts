import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GaleriaService {
  constructor(private prisma: PrismaService) {}

  async getGaleria(soloPublicados: boolean) {
    const galeria = await this.prisma.galeria_multimedia.findMany({
      where: soloPublicados ? { publicado: true } : {},
      orderBy: { fecha_subida: 'desc' },
      include: {
        usuarios: {
          include: { personas: true },
        },
      },
    });

    return galeria.map((g) => ({
      ...g,
      autor_email: g.usuarios?.email,
      autor_nombres: g.usuarios?.personas?.nombres,
      autor_apellido: g.usuarios?.personas?.ape_paterno,
    }));
  }

  async createMedia(data: any, id_usuario_autor: number) {
    return this.prisma.galeria_multimedia.create({
      data: {
        id_usuario_autor,
        url_archivo: data.url_archivo,
        tipo_archivo: data.tipo_archivo,
        publicado: data.publicado ?? false,
        id_torneo: data.id_torneo || null,
        id_partido: data.id_partido || null,
        id_espacio: data.id_espacio || null,
        id_carrera: data.id_carrera || null,
      },
    });
  }

  async updateMedia(id: number, data: any) {
    const existe = await this.prisma.galeria_multimedia.findUnique({
      where: { id_multimedia: id },
    });
    if (!existe) throw new NotFoundException('Elemento no encontrado');

    return this.prisma.galeria_multimedia.update({
      where: { id_multimedia: id },
      data: {
        publicado: data.publicado !== undefined ? data.publicado : undefined,
        id_torneo: data.id_torneo || null,
        id_partido: data.id_partido || null,
        id_espacio: data.id_espacio || null,
        id_carrera: data.id_carrera || null,
      },
    });
  }

  async deleteMedia(id: number) {
    const existe = await this.prisma.galeria_multimedia.findUnique({
      where: { id_multimedia: id },
    });
    if (!existe) throw new NotFoundException('Elemento no encontrado');

    await this.prisma.galeria_multimedia.delete({
      where: { id_multimedia: id },
    });
    return true;
  }
}
