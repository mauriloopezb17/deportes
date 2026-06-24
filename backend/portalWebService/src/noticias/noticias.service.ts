import { Inject, Injectable } from '@nestjs/common';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OracleStorageService } from '../oracle-storage/oracle-storage.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class NoticiasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly oracleStorage: OracleStorageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // <-- 2. Usas la interfaz limpia
  ) {}

  async create(createNoticiaDto: CreateNoticiaDto, authorId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const fechaPublicacion = createNoticiaDto.publicado ? new Date() : null;

      const noticia = await tx.noticias.create({
        data: {
          id_usuario_autor: authorId,
          id_categoria_noticia: createNoticiaDto.id_categoria_noticia,
          titulo: createNoticiaDto.titulo,
          contenido: createNoticiaDto.contenido ?? {},
          resumen: createNoticiaDto.resumen || null,
          publicado: createNoticiaDto.publicado || false,
          fecha_creacion: new Date(),
          fecha_publicacion: fechaPublicacion,
        },
      });
      const contenidoFinal = await this.procesarImagenesContenido(
        createNoticiaDto.contenido,
        noticia.id_noticia,
        tx,
      );

      await tx.noticias.update({
        where: { id_noticia: noticia.id_noticia },
        data: {
          contenido: contenidoFinal ?? {},
        },
      });

      if (createNoticiaDto.imagenes && createNoticiaDto.imagenes.length > 0) {
        for (const img of createNoticiaDto.imagenes) {
          await tx.noticias_imagenes.create({
            data: {
              id_noticia: noticia.id_noticia,
              url_storage: img.url_storage,
              es_portada: img.es_portada,
            },
          });
        }
      }

      return { id_noticia: noticia.id_noticia, contenido: contenidoFinal };
    });

    await this.cacheManager.del('todas_las_noticias');
    return result;
  }

  async findAll(soloPublicados = false) {
    console.log(
      'alguien k me kiere mucho m trajo estas notisias de postgresql',
    );
    const noticiasList = await this.prisma.noticias.findMany({
      where: soloPublicados ? { publicado: true } : {},
      orderBy: { fecha_creacion: 'desc' },
      include: {
        categorias_noticia: true,
        usuarios: {
          include: {
            personas: true,
          },
        },
        noticias_imagenes: {
          where: { es_portada: true },
          take: 1,
        },
      },
    });

    return noticiasList.map((n) => ({
      id_noticia: n.id_noticia,
      id_usuario_autor: n.id_usuario_autor,
      id_categoria_noticia: n.id_categoria_noticia,
      titulo: n.titulo,
      contenido: n.contenido,
      resumen: n.resumen,
      publicado: n.publicado,
      fecha_creacion: n.fecha_creacion,
      fecha_publicacion: n.fecha_publicacion,
      categoria_nombre: n.categorias_noticia?.nombre || '',
      autor_nombre: n.usuarios?.personas?.nombres || '',
      autor_apellido: n.usuarios?.personas?.ape_paterno || '',
      imagen_portada: n.noticias_imagenes?.[0]?.url_storage || null,
    }));
  }

  async findOne(id: number) {
    const n = await this.prisma.noticias.findUnique({
      where: { id_noticia: id },
      include: {
        categorias_noticia: true,
        usuarios: {
          include: {
            personas: true,
          },
        },
        noticias_imagenes: true,
      },
    });

    if (!n) return null;

    return {
      id_noticia: n.id_noticia,
      id_usuario_autor: n.id_usuario_autor,
      id_categoria_noticia: n.id_categoria_noticia,
      titulo: n.titulo,
      contenido: n.contenido,
      resumen: n.resumen,
      publicado: n.publicado,
      fecha_creacion: n.fecha_creacion,
      fecha_publicacion: n.fecha_publicacion,
      categoria_nombre: n.categorias_noticia?.nombre || '',
      autor_nombre: n.usuarios?.personas?.nombres || '',
      autor_apellido: n.usuarios?.personas?.ape_paterno || '',
      imagenes: n.noticias_imagenes.map((img) => ({
        url_storage: img.url_storage,
        es_portada: img.es_portada,
      })),
    };
  }

  async update(id: number, updateNoticiaDto: UpdateNoticiaDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const dataToUpdate: Prisma.noticiasUpdateInput = {};

      if (updateNoticiaDto.titulo !== undefined)
        dataToUpdate.titulo = updateNoticiaDto.titulo;
      if (updateNoticiaDto.resumen !== undefined)
        dataToUpdate.resumen = updateNoticiaDto.resumen;
      if (updateNoticiaDto.publicado !== undefined) {
        dataToUpdate.publicado = updateNoticiaDto.publicado;
        if (updateNoticiaDto.publicado) {
          dataToUpdate.fecha_publicacion = new Date();
        }
      }

      if (updateNoticiaDto.id_categoria_noticia !== undefined) {
        dataToUpdate.categorias_noticia = {
          connect: {
            id_categoria_noticia: updateNoticiaDto.id_categoria_noticia,
          },
        };
      }

      let contenidoFinal = updateNoticiaDto.contenido;
      if (updateNoticiaDto.contenido) {
        // Eliminar las imágenes del contenido anteriores (no portadas)
        await tx.noticias_imagenes.deleteMany({
          where: { id_noticia: id, es_portada: false },
        });

        contenidoFinal = await this.procesarImagenesContenido(
          updateNoticiaDto.contenido,
          id,
          tx,
        );
        dataToUpdate.contenido = contenidoFinal ?? {};
      }

      if (Object.keys(dataToUpdate).length > 0) {
        await tx.noticias.update({
          where: { id_noticia: id },
          data: dataToUpdate,
        });
      }

      if (updateNoticiaDto.imagenes) {
        // Eliminar imágenes de portada anteriores
        await tx.noticias_imagenes.deleteMany({
          where: { id_noticia: id, es_portada: true },
        });

        for (const img of updateNoticiaDto.imagenes) {
          await tx.noticias_imagenes.create({
            data: {
              id_noticia: id,
              url_storage: img.url_storage,
              es_portada: img.es_portada,
            },
          });
        }
      }

      return contenidoFinal;
    });

    await this.cacheManager.del('todas_las_noticias');
    await this.cacheManager.del(`/noticias/${id}`);
    return result;
  }

  async remove(id: number) {
    // 1. Eliminar imágenes asociadas
    await this.prisma.noticias_imagenes.deleteMany({
      where: { id_noticia: id },
    });

    // 2. Eliminar noticia
    try {
      await this.prisma.noticias.delete({
        where: { id_noticia: id },
      });
      await this.cacheManager.del('todas_las_noticias');
      await this.cacheManager.del(`/noticias/${id}`);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getCategorias() {
    return this.prisma.categorias_noticia.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getNoticiasByUsuario(idUsuario: number) {
    const noticiasList = await this.prisma.noticias.findMany({
      where: { id_usuario_autor: idUsuario },
      orderBy: { fecha_creacion: 'desc' },
      include: {
        categorias_noticia: true,
        usuarios: {
          include: {
            personas: true,
          },
        },
        noticias_imagenes: {
          where: { es_portada: true },
          take: 1,
        },
      },
    });

    return noticiasList.map((n) => ({
      id_noticia: n.id_noticia,
      id_usuario_autor: n.id_usuario_autor,
      id_categoria_noticia: n.id_categoria_noticia,
      titulo: n.titulo,
      contenido: n.contenido,
      resumen: n.resumen,
      publicado: n.publicado,
      fecha_creacion: n.fecha_creacion,
      fecha_publicacion: n.fecha_publicacion,
      categoria_nombre: n.categorias_noticia?.nombre || '',
      autor_nombre: n.usuarios?.personas?.nombres || '',
      autor_apellido: n.usuarios?.personas?.ape_paterno || '',
      imagen_portada: n.noticias_imagenes?.[0]?.url_storage || null,
    }));
  }

  private async procesarImagenesContenido(
    contenido: any,
    id_noticia: number,
    tx: Prisma.TransactionClient,
  ): Promise<any> {
    if (!contenido?.blocks) return contenido;

    const blocks = await Promise.all(
      contenido.blocks.map(async (block: any) => {
        if (block.type === 'image' && block.data?.file?.url) {
          const url = block.data.file.url;

          if (url.includes('/temp/')) {
            console.log(`[TEMP] Procesando: ${url}`);
            const urlOCI = await this.oracleStorage.subirTempAOCI(url);
            console.log(`[TEMP] Subido a OCI: ${urlOCI}`);

            await tx.noticias_imagenes.create({
              data: {
                id_noticia,
                url_storage: urlOCI,
                es_portada: false,
              },
            });

            return {
              ...block,
              data: {
                ...block.data,
                file: {
                  ...block.data.file,
                  url: urlOCI,
                },
              },
            };
          } else {
            await tx.noticias_imagenes.create({
              data: {
                id_noticia,
                url_storage: url,
                es_portada: false,
              },
            });
            return block;
          }
        }
        return block;
      }),
    );

    return { ...contenido, blocks };
  }
}
