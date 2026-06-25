import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { UpdatePersonaDto } from "./dto/update-persona.dto";

@ApiTags("Personas")
@Injectable()
export class PersonaService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Crear una nueva persona" })
  async create(createPersonaDto: CreatePersonaDto) {
    const data = this.normalizePersonaData(createPersonaDto);
    const ci = this.parseCarnet(data.carnet);
    await this.ensureUniquePersona(data.email, ci);
    const jugadorRole = await this.findRole("JUGADOR");

    try {
      const usuario = await this.prisma.$transaction(async (tx) => {
        const persona = await tx.personas.create({
          data: {
            nombres: data.nombre,
            ape_paterno: data.apellido,
            ape_materno: "",
            fecha_nacimiento: new Date("2000-01-01T00:00:00.000Z"),
            celular: data.celular,
            ci,
          },
        });

        return tx.usuarios.create({
          data: {
            id_persona: persona.id_persona,
            id_rol: jugadorRole?.id_rol || 1,
            email: data.email,
            hash_password: await bcrypt.hash("Cambiar123", 10),
            activo: true,
          },
          include: { personas: true, roles: true },
        });
      });

      return this.toLegacyPersona(usuario);
    } catch (error: any) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  @ApiOperation({ summary: "Obtener todas las personas" })
  async findAll() {
    const personas = await this.prisma.personas.findMany({
      include: { usuarios: { include: { roles: true } } },
      orderBy: { id_persona: "asc" },
    });

    return personas.map((persona) => this.toLegacyPersonaFromPersona(persona));
  }

  @ApiOperation({ summary: "Obtener una persona por ID" })
  async findOne(id: number) {
    const persona = await this.prisma.personas.findUnique({
      where: { id_persona: id },
      include: { usuarios: { include: { roles: true } } },
    });

    return persona ? this.toLegacyPersonaFromPersona(persona) : null;
  }

  @ApiOperation({ summary: "Actualizar una persona" })
  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    const data = this.normalizePersonaData(updatePersonaDto);
    const ci = data.carnet ? this.parseCarnet(data.carnet) : undefined;
    await this.ensureUniquePersona(data.email, ci, id);

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.personas.update({
          where: { id_persona: id },
          data: {
            ...(data.nombre ? { nombres: data.nombre } : {}),
            ...(data.apellido ? { ape_paterno: data.apellido } : {}),
            ...(data.celular ? { celular: data.celular } : {}),
            ...(ci ? { ci } : {}),
          },
        });

        if (data.email) {
          await tx.usuarios.updateMany({
            where: { id_persona: id },
            data: { email: data.email },
          });
        }
      });
    } catch (error: any) {
      this.handleUniqueError(error);
      throw error;
    }

    return this.findOne(id);
  }

  @ApiOperation({ summary: "Eliminar una persona" })
  async remove(id: number): Promise<void> {
    await this.prisma.usuarios.deleteMany({ where: { id_persona: id } });
    await this.prisma.personas.delete({ where: { id_persona: id } });
  }

  private toLegacyPersona(usuario: any) {
    return this.toLegacyPersonaFromPersona({
      ...usuario.personas,
      usuarios: [{ ...usuario, personas: undefined }],
    });
  }

  private toLegacyPersonaFromPersona(persona: any) {
    const usuario = persona.usuarios?.[0];

    return {
      id: persona.id_persona,
      nombre: persona.nombres,
      apellido: [persona.ape_paterno, persona.ape_materno].filter(Boolean).join(" ").trim(),
      carnet: String(persona.ci),
      email: usuario?.email,
      celular: persona.celular,
      roles: usuario?.roles
        ? [{ rol: { id: usuario.roles.id_rol, nombre: usuario.roles.nombre_rol } }]
        : [],
    };
  }

  private normalizePersonaData<T extends Partial<CreatePersonaDto>>(data: T): T {
    return {
      ...data,
      nombre: data.nombre?.trim(),
      apellido: data.apellido?.trim(),
      carnet: data.carnet?.trim(),
      email: data.email?.trim().toLowerCase(),
      celular: data.celular?.trim(),
    };
  }

  private parseCarnet(carnet?: string): number {
    const ci = Number.parseInt(carnet || "", 10);
    if (!Number.isFinite(ci) || ci > 2147483647) {
      throw new BadRequestException("El carnet debe ser numerico y menor o igual a 2147483647");
    }
    return ci;
  }

  private async ensureUniquePersona(email?: string, ci?: number, currentId?: number) {
    if (email) {
      const existingUser = await this.prisma.usuarios.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
          ...(currentId ? { id_persona: { not: currentId } } : {}),
        },
      });

      if (existingUser) {
        throw new ConflictException("El email ya esta registrado");
      }
    }

    if (ci) {
      const existingPersona = await this.prisma.personas.findFirst({
        where: {
          ci,
          ...(currentId ? { id_persona: { not: currentId } } : {}),
        },
      });

      if (existingPersona) {
        throw new ConflictException("El carnet ya esta registrado");
      }
    }
  }

  private async findRole(role: string) {
    return this.prisma.roles.findFirst({
      where: {
        OR: [
          { nombre_rol: { equals: role, mode: "insensitive" } },
          { nombre_rol: { contains: role, mode: "insensitive" } },
          { nombre_rol: { contains: "Jugador", mode: "insensitive" } },
        ],
      },
    });
  }

  private handleUniqueError(error: any): void {
    if (error?.code === "P2002" || error?.code === "23505") {
      throw new ConflictException("El email o carnet ya esta registrado");
    }
  }
}
