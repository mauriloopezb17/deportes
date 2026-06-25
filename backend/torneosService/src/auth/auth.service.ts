import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@ApiTags("Auth")
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: "Validar usuario y contrasena" })
  async validateUser(email: string, password: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    const usuario = await this.prisma.usuarios.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      include: { personas: true, roles: true, delegados_carrera: true },
    });

    if (!usuario?.hash_password || !usuario.activo) {
      return null;
    }

    const match = await bcrypt.compare(password, usuario.hash_password);
    if (!match) {
      return null;
    }

    return this.toLegacyUser(usuario);
  }

  @ApiOperation({ summary: "Iniciar sesion" })
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Credenciales invalidas");
    }

    const payload = {
      email: user.email,
      sub: user.id,
      persona_id: user.persona_id,
      roles: user.roles,
      carrera_id: user.carrera_id,
    };

    const usuario = {
      id: user.id,
      persona_id: user.persona_id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      roles: user.roles,
      carrera_id: user.carrera_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario,
      user: usuario,
    };
  }

  @ApiOperation({ summary: "Registrar un nuevo usuario" })
  async register(personaData: any, password: string, role?: string): Promise<any> {
    const normalizedPersonaData = {
      ...personaData,
      nombre: personaData.nombre?.trim(),
      apellido: personaData.apellido?.trim(),
      carnet: personaData.carnet?.trim(),
      email: personaData.email?.trim().toLowerCase(),
      celular: personaData.celular?.trim(),
    };

    if (!password?.trim()) {
      throw new BadRequestException("La contrasena es obligatoria");
    }

    const carnetNumber = this.parseCarnet(normalizedPersonaData.carnet);
    const existingUser = await this.prisma.usuarios.findFirst({
      where: {
        email: { equals: normalizedPersonaData.email, mode: "insensitive" },
      },
    });
    const existingPersona = await this.prisma.personas.findFirst({
      where: { ci: carnetNumber },
    });

    if (existingUser) {
      throw new ConflictException("El email ya esta registrado");
    }

    if (existingPersona) {
      throw new ConflictException("El carnet ya esta registrado");
    }

    const selectedRole = await this.findRole(role);
    if (!selectedRole) {
      throw new BadRequestException("No existe un rol compatible en la base de datos");
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    try {
      const saved = await this.prisma.$transaction(async (tx) => {
        const persona = await tx.personas.create({
          data: {
            nombres: normalizedPersonaData.nombre,
            ape_paterno: normalizedPersonaData.apellido,
            ape_materno: "",
            fecha_nacimiento: new Date("2000-01-01T00:00:00.000Z"),
            celular: normalizedPersonaData.celular,
            ci: carnetNumber,
          },
        });

        return tx.usuarios.create({
          data: {
            id_persona: persona.id_persona,
            id_rol: selectedRole.id_rol,
            email: normalizedPersonaData.email,
            hash_password: hashedPassword,
            activo: true,
          },
          include: { personas: true, roles: true },
        });
      });

      return this.toLegacyUser(saved);
    } catch (error: any) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  private normalizeRole(role: string): string {
    const roles: Record<string, string> = {
      Administrador: "ADMIN",
      Admin: "ADMIN",
      Delegado: "DELEGADO",
      Jugador: "JUGADOR",
    };

    return roles[role] || role.toUpperCase().replace(/\s+/g, "_");
  }

  private toDatabaseRole(role?: string): string {
    const roles: Record<string, string> = {
      ADMIN: "Administrador",
      ADMINISTRADOR: "Administrador",
      DELEGADO: "Delegado",
      JUGADOR: "Jugador",
    };

    return roles[role?.toUpperCase() || ""] || "Jugador";
  }

  private async findRole(role?: string) {
    const databaseRole = this.toDatabaseRole(role);
    return this.prisma.roles.findFirst({
      where: {
        OR: [
          { nombre_rol: { equals: databaseRole, mode: "insensitive" } },
          { nombre_rol: { contains: databaseRole, mode: "insensitive" } },
          { nombre_rol: { contains: role || "Jugador", mode: "insensitive" } },
        ],
      },
    });
  }

  private toLegacyUser(usuario: any) {
    const persona = usuario.personas;
    const roles = usuario.roles?.nombre_rol
      ? [this.normalizeRole(usuario.roles.nombre_rol)]
      : [];

    return {
      id: usuario.id_usuario,
      persona_id: usuario.id_persona,
      nombre: persona?.nombres,
      apellido: [persona?.ape_paterno, persona?.ape_materno]
        .filter(Boolean)
        .join(" ")
        .trim(),
      carnet: persona?.ci ? String(persona.ci) : undefined,
      email: usuario.email,
      celular: persona?.celular,
      roles,
      carrera_id: usuario.delegados_carrera?.find((delegado: any) => delegado.activo)
        ?.id_carrera,
    };
  }

  private parseCarnet(carnet?: string): number {
    const ci = Number.parseInt(carnet || "", 10);
    if (!Number.isFinite(ci) || ci > 2147483647) {
      throw new BadRequestException("El carnet debe ser numerico y menor o igual a 2147483647");
    }
    return ci;
  }

  private handleUniqueError(error: any): void {
    if (error?.code === "P2002" || error?.code === "23505") {
      throw new ConflictException("El email o carnet ya esta registrado");
    }
  }
}
