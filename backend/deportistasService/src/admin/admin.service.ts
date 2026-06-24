import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { InscribirDeportistaDto } from './dto/inscribir-deportista.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async inscribirDeportistaExterno(data: InscribirDeportistaDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const persona = await tx.persona.create({
          data: {
            nombres: data.deportista.nombres,
            ape_paterno: data.deportista.ape_paterno,
            ape_materno: data.deportista.ape_materno,
            fecha_nacimiento: new Date(data.deportista.fecha_nacimiento),
            celular: data.deportista.celular,
            ci: data.deportista.ci,
            complemento: data.deportista.complemento,
          },
        });
        const hashPassword = await bcrypt.hash(
          data.deportista.ci.toString(),
          10,
        );
        await tx.usuario.create({
          data: {
            id_persona: persona.id_persona,
            id_rol: 4,
            email: data.deportista.email,
            hash_password: hashPassword,
            activo: true,
          },
        });
        let idPersonaTutor: number | null = null;
        if (data.tutor && data.tutor.nombres) {
          const tutor = await tx.persona.create({
            data: {
              nombres: data.tutor.nombres,
              ape_paterno: data.tutor.ape_paterno || '',
              ape_materno: data.tutor.ape_materno || '',
              fecha_nacimiento: data.tutor.fecha_nacimiento
                ? new Date(data.tutor.fecha_nacimiento)
                : new Date(),
              celular: data.tutor.celular || '',
              ci: data.tutor.ci || 0,
              complemento: data.tutor.complemento,
            },
          });
          idPersonaTutor = tutor.id_persona;
          if (data.tutor.email && data.tutor.ci) {
            const hashPassTutor = await bcrypt.hash(
              data.tutor.ci.toString(),
              10,
            );
            await tx.usuario.create({
              data: {
                id_persona: idPersonaTutor,
                id_rol: 4,
                email: data.tutor.email,
                hash_password: hashPassTutor,
                activo: true,
              },
            });
          }
        }
        const deportista = await tx.deportista.create({
          data: {
            id_persona: persona.id_persona,
            id_persona_tutor: idPersonaTutor,
            tipo_deportista: 'Externo',
            talla_ropa: data.deportista.talla_ropa,
          },
        });
        await tx.deportistaExterno.create({
          data: {
            id_deportista: deportista.id_deportista,
            colegio_instituto: data.deportista.colegio_instituto,
            curso: data.deportista.curso,
          },
        });
        await tx.inscripcion.create({
          data: {
            id_deportista: deportista.id_deportista,
            id_disciplina: data.inscripcion.id_disciplina,
            id_categoria: data.inscripcion.id_categoria,
            fecha_inscripcion: new Date(),
            estado: 'Activo',
          },
        });
        if (data.ficha_medica) {
          await tx.fichaMedica.create({
            data: {
              id_deportista: deportista.id_deportista,
              tipo_sangre: data.ficha_medica.tipo_sangre,
              seguro_medico: data.ficha_medica.seguro_medico,
              enfermedades_padecimientos:
                data.ficha_medica.enfermedades_padecimientos,
              contacto_emergencia_nombre:
                data.ficha_medica.contacto_emergencia_nombre,
              contacto_emergencia_telefono:
                data.ficha_medica.contacto_emergencia_telefono,
            },
          });
        }
        if (data.experiencias && data.experiencias.length > 0) {
          await tx.historialExperienciaDeportiva.createMany({
            data: data.experiencias.map((exp) => ({
              id_deportista: deportista.id_deportista,
              tipo_participacion: exp.tipo_participacion,
              gestion: exp.gestion,
              club_sede: exp.club_sede,
              categoria_jugada: exp.categoria_jugada,
            })),
          });
        }
        await this.cacheManager.del('lista_deportistas_general');

        return {
          success: true,
          message: 'Deportista inscrito correctamente',
          id_deportista: deportista.id_deportista,
        };
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El correo electrónico o CI ya está registrado en el sistema.',
        );
      }
      throw new InternalServerErrorException(
        'Error interno del servidor al inscribir deportista',
      );
    }
  }
  async registrarUsuarioSistema(data: CrearUsuarioDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const persona = await tx.persona.create({
          data: {
            nombres: data.nombres,
            ape_paterno: data.ape_paterno,
            ape_materno: data.ape_materno || '',
            fecha_nacimiento: new Date(data.fecha_nacimiento),
            celular: data.celular,
            ci: parseInt(data.ci, 10),
          },
        });

        const hashPassword = await bcrypt.hash(data.ci.toString(), 10);

        const usuario = await tx.usuario.create({
          data: {
            id_persona: persona.id_persona,
            id_rol: data.id_rol,
            email: data.email,
            hash_password: hashPassword,
            activo: true,
          },
        });
        if (data.id_rol === 3) {
          await tx.delegadoCarrera.create({
            data: {
              id_usuario: usuario.id_usuario,
              id_carrera: data.id_carrera!,
              gestion: data.gestion!,
              activo: true,
            },
          });
          await this.cacheManager.del('carreras_activas_listado');
        }

        return {
          success: true,
          message: 'Usuario registrado exitosamente en el sistema',
        };
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El correo electrónico o Carnet de Identidad ya está registrado.',
        );
      }
      throw new InternalServerErrorException(
        'Error interno del servidor al registrar el usuario',
      );
    }
  }

  async getCatalogosFormulario() {
    const cacheKey = 'catalogos_inscripcion_formulario';
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const disciplinas = await this.prisma.disciplina.findMany({
      where: { activo: true },
      orderBy: { nombre_disciplina: 'asc' },
      select: { id_disciplina: true, nombre_disciplina: true },
    });

    const categorias = await this.prisma.categoria.findMany({
      orderBy: { nombre_categoria: 'asc' },
      select: { id_categoria: true, nombre_categoria: true },
    });

    const result = { disciplinas, categorias };
    await this.cacheManager.set(cacheKey, result, 86400000);
    return result;
  }

  async obtenerTodosLosRoles() {
    const cacheKey = 'roles_sistema_listado';
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const roles = await this.prisma.rol.findMany({
      orderBy: { id_rol: 'asc' },
      select: { id_rol: true, nombre_rol: true, descripcion: true },
    });

    await this.cacheManager.set(cacheKey, roles, 86400000);
    return roles;
  }

  async getCarreras() {
    const cacheKey = 'carreras_activas_listado';
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const carreras = await this.prisma.carrera.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: { id_carrera: true, nombre: true, sigla: true },
    });

    await this.cacheManager.set(cacheKey, carreras, 86400000);
    return carreras;
  }

  async getListaDeportistas() {
    const cacheKey = 'lista_deportistas_general';
    const cachedData = await this.cacheManager.get<any[]>(cacheKey);
    if (cachedData) return cachedData;

    const deportistas = await this.prisma.deportista.findMany({
      include: {
        persona: true,
        inscripciones: {
          include: {
            disciplina: true,
            categoria: true,
          },
          orderBy: {
            fecha_inscripcion: 'desc',
          },
        },
      },
    });

    const flatResult = deportistas.flatMap((d): any[] => {
      if (d.inscripciones.length === 0) {
        return [
          {
            id_deportista: d.id_deportista,
            nombres: d.persona.nombres,
            ape_paterno: d.persona.ape_paterno,
            ape_materno: d.persona.ape_materno,
            ci: d.persona.ci,
            complemento: d.persona.complemento,
            celular: d.persona.celular,
            tipo_deportista: d.tipo_deportista,
            talla_ropa: d.talla_ropa,
            fecha_inscripcion: null,
            estado_inscripcion: null,
            nombre_disciplina: null,
            nombre_categoria: null,
          },
        ];
      }

      return d.inscripciones.map((i) => ({
        id_deportista: d.id_deportista,
        nombres: d.persona.nombres,
        ape_paterno: d.persona.ape_paterno,
        ape_materno: d.persona.ape_materno,
        ci: d.persona.ci,
        complemento: d.persona.complemento,
        celular: d.persona.celular,
        tipo_deportista: d.tipo_deportista,
        talla_ropa: d.talla_ropa,
        fecha_inscripcion: i.fecha_inscripcion,
        estado_inscripcion: i.estado,
        nombre_disciplina: i.disciplina.nombre_disciplina,
        nombre_categoria: i.categoria.nombre_categoria,
      }));
    });

    flatResult.sort((a, b) => {
      if (!a.fecha_inscripcion) return 1;
      if (!b.fecha_inscripcion) return -1;
      return (
        new Date(b.fecha_inscripcion).getTime() -
        new Date(a.fecha_inscripcion).getTime()
      );
    });

    await this.cacheManager.set(cacheKey, flatResult, 600000);
    return flatResult;
  }

  async alternarEstadoDeportista(idDeportista: number) {
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { id_deportista: idDeportista },
    });

    if (inscripciones.length === 0) {
      return [];
    }

    const actualizados: any[] = [];
    for (const insc of inscripciones) {
      let nuevoEstado = 'Activo';

      if (insc.estado === 'Activo') {
        nuevoEstado = 'Abandono';
      } else if (insc.estado === 'Abandono') {
        nuevoEstado = 'Desactivado';
      } else {
        nuevoEstado = 'Activo';
      }

      const updated = await this.prisma.inscripcion.update({
        where: { id_inscripcion: insc.id_inscripcion },
        data: { estado: nuevoEstado },
      });
      actualizados.push(updated);
    }

    await this.cacheManager.del('lista_deportistas_general');

    return actualizados;
  }
}
