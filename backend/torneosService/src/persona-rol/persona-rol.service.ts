import { Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePersonaRolDto } from "./dto/create-persona-rol.dto";

@ApiTags("Persona-Rol")
@Injectable()
export class PersonaRolService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Asignar un rol a una persona" })
  async create(createPersonaRolDto: CreatePersonaRolDto) {
    const usuario = await this.prisma.usuarios.updateMany({
      where: { id_persona: createPersonaRolDto.persona_id },
      data: { id_rol: createPersonaRolDto.rol_id },
    });

    return {
      persona_id: createPersonaRolDto.persona_id,
      rol_id: createPersonaRolDto.rol_id,
      affected: usuario.count,
    };
  }

  @ApiOperation({ summary: "Obtener todas las relaciones persona-rol" })
  async findAll() {
    const usuarios = await this.prisma.usuarios.findMany({
      include: { personas: true, roles: true },
      orderBy: { id_usuario: "asc" },
    });
    return usuarios.map((usuario) => this.toLegacyPersonaRol(usuario));
  }

  @ApiOperation({ summary: "Obtener roles de una persona" })
  async findByPersona(personaId: number) {
    const usuarios = await this.prisma.usuarios.findMany({
      where: { id_persona: personaId },
      include: { roles: true },
    });
    return usuarios.map((usuario) => this.toLegacyPersonaRol(usuario));
  }

  @ApiOperation({ summary: "Eliminar un rol de una persona" })
  async remove(personaId: number, rolId: number): Promise<void> {
    const fallbackRole = await this.prisma.roles.findFirst({
      where: { id_rol: { not: rolId } },
      orderBy: { id_rol: "asc" },
    });

    if (!fallbackRole) {
      return;
    }

    await this.prisma.usuarios.updateMany({
      where: { id_persona: personaId, id_rol: rolId },
      data: { id_rol: fallbackRole.id_rol },
    });
  }

  private toLegacyPersonaRol(usuario: any) {
    return {
      persona_id: usuario.id_persona,
      rol_id: usuario.id_rol,
      persona: usuario.personas
        ? {
            id: usuario.personas.id_persona,
            nombre: usuario.personas.nombres,
            apellido: [usuario.personas.ape_paterno, usuario.personas.ape_materno]
              .filter(Boolean)
              .join(" ")
              .trim(),
          }
        : undefined,
      rol: usuario.roles
        ? { id: usuario.roles.id_rol, nombre: usuario.roles.nombre_rol }
        : undefined,
    };
  }
}
