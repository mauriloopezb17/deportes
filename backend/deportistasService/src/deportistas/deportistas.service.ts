import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeportistasService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async obtenerJugadoresDestacados() {
    const cacheKey = 'jugadores_destacados_lista';
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;
    const registros = await this.prisma.registroFederacion.findMany({
      include: {
        deportista: {
          include: {
            persona: true,
          },
        },
        disciplina: true,
        categoria: true,
      },
    });

    const destacados = registros.map((rf) => ({
      id_deportista: rf.deportista.id_deportista,
      nombres: rf.deportista.persona.nombres,
      ape_paterno: rf.deportista.persona.ape_paterno,
      ape_materno: rf.deportista.persona.ape_materno,
      url_foto: rf.deportista.url_foto,
      nombre_disciplina: rf.disciplina.nombre_disciplina,
      nombre_categoria: rf.categoria?.nombre_categoria || null,
    }));

    destacados.sort((a, b) => a.nombres.localeCompare(b.nombres));

    await this.cacheManager.set(cacheKey, destacados, 14400000);
    return destacados;
  }
}
