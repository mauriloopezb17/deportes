import { BadRequestException, Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDelegadoCarreraDto } from "./dto/create-delegado-carrera.dto";

@ApiTags("Delegados-Carrera")
@Injectable()
export class DelegadoCarreraService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Asignar un delegado a una carrera" })
  async create(createDelegadoCarreraDto: CreateDelegadoCarreraDto) {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id_persona: createDelegadoCarreraDto.persona_id },
    });

    if (!usuario) {
      throw new BadRequestException("La persona no tiene usuario asociado");
    }

    const delegado = await this.prisma.delegados_carrera.create({
      data: {
        id_usuario: usuario.id_usuario,
        id_carrera: createDelegadoCarreraDto.carrera_id,
        gestion: new Date().getFullYear(),
        activo: true,
      },
      include: { carreras: true, usuarios: { include: { personas: true } } },
    });

    return this.toLegacyDelegado(delegado);
  }

  @ApiOperation({ summary: "Obtener todos los delegados por carrera" })
  async findAll() {
    const delegados = await this.prisma.delegados_carrera.findMany({
      include: { carreras: true, usuarios: { include: { personas: true } } },
      orderBy: { id_delegado_carrera: "asc" },
    });
    return delegados.map((delegado) => this.toLegacyDelegado(delegado));
  }

  @ApiOperation({ summary: "Obtener el delegado de una carrera" })
  async findByCarrera(carreraId: number) {
    const delegado = await this.prisma.delegados_carrera.findFirst({
      where: { id_carrera: carreraId, activo: true },
      include: { carreras: true, usuarios: { include: { personas: true } } },
    });
    return delegado ? this.toLegacyDelegado(delegado) : null;
  }

  @ApiOperation({ summary: "Eliminar un delegado de una carrera" })
  async remove(personaId: number, carreraId: number): Promise<void> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id_persona: personaId },
    });

    if (!usuario) {
      return;
    }

    await this.prisma.delegados_carrera.updateMany({
      where: { id_usuario: usuario.id_usuario, id_carrera: carreraId },
      data: { activo: false },
    });
  }

  private toLegacyDelegado(delegado: any) {
    const persona = delegado.usuarios?.personas;
    return {
      persona_id: delegado.usuarios?.id_persona,
      carrera_id: delegado.id_carrera,
      id_delegado_carrera: delegado.id_delegado_carrera,
      gestion: delegado.gestion,
      activo: delegado.activo,
      persona: persona
        ? {
            id: persona.id_persona,
            nombre: persona.nombres,
            apellido: [persona.ape_paterno, persona.ape_materno]
              .filter(Boolean)
              .join(" ")
              .trim(),
          }
        : undefined,
      carrera: delegado.carreras
        ? { id: delegado.carreras.id_carrera, nombre: delegado.carreras.nombre }
        : undefined,
    };
  }
}
