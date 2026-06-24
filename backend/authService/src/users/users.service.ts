import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: {
        persona: true,
        rol: true,
      },
    });
  }

  async create(data: CreateUserDto) {
    const {
      nombres,
      ape_paterno,
      ape_materno,
      fecha_nacimiento,
      celular,
      ci,
      complemento,
      email,
      password,
      id_rol,
    } = data;

    const userExists = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const saltRounds = 10;
    const hash_password = password
      ? await bcrypt.hash(password, saltRounds)
      : '';

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        email,
        hash_password,
        activo: true,
        rol: {
          connect: { id_rol },
        },
        persona: {
          create: {
            nombres,
            ape_paterno,
            ape_materno: ape_materno || '',
            fecha_nacimiento: new Date(fecha_nacimiento),
            celular,
            ci: parseInt(ci.toString(), 10),
            complemento: complemento || null,
          },
        },
        ...(id_rol === 3 &&
          data.id_carrera &&
          data.gestion && {
            delegados: {
              create: {
                id_carrera: data.id_carrera,
                gestion: data.gestion,
              },
            },
          }),
      },
      include: {
        persona: true,
        delegados: true,
      },
    });

    return nuevoUsuario;
  }

  async updatePassword(email: string, hash_password: string) {
    return this.prisma.usuario.update({
      where: { email },
      data: { hash_password },
    });
  }
}
