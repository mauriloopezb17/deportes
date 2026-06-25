import { Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRolDto } from "./dto/create-rol.dto";
import { UpdateRolDto } from "./dto/update-rol.dto";

@ApiTags("Roles")
@Injectable()
export class RolService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Crear un nuevo rol" })
  async create(createRolDto: CreateRolDto) {
    const rol = await this.prisma.roles.create({
      data: { nombre_rol: createRolDto.nombre },
    });
    return this.toLegacyRol(rol);
  }

  @ApiOperation({ summary: "Obtener todos los roles" })
  async findAll() {
    const roles = await this.prisma.roles.findMany({
      orderBy: { id_rol: "asc" },
    });
    return roles.map((rol) => this.toLegacyRol(rol));
  }

  @ApiOperation({ summary: "Obtener un rol por ID" })
  async findOne(id: number) {
    const rol = await this.prisma.roles.findUnique({ where: { id_rol: id } });
    return rol ? this.toLegacyRol(rol) : null;
  }

  @ApiOperation({ summary: "Actualizar un rol" })
  async update(id: number, updateRolDto: UpdateRolDto) {
    const rol = await this.prisma.roles.update({
      where: { id_rol: id },
      data: {
        ...(updateRolDto.nombre ? { nombre_rol: updateRolDto.nombre } : {}),
      },
    });
    return this.toLegacyRol(rol);
  }

  @ApiOperation({ summary: "Eliminar un rol" })
  async remove(id: number): Promise<void> {
    await this.prisma.roles.delete({ where: { id_rol: id } });
  }

  private toLegacyRol(rol: any) {
    return {
      id: rol.id_rol,
      nombre: rol.nombre_rol,
      descripcion: rol.descripcion,
    };
  }
}
