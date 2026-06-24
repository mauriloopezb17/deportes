import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  @Roles('admin')
  @Get('roles')
  async getRoles() {
    return this.prisma.rol.findMany({
      orderBy: { id_rol: 'asc' },
    });
  }

  @Roles('admin')
  @Post('usuarios/registrar')
  async registrarUsuario(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.id_rol === 3) {
      if (!createUserDto.id_carrera || !createUserDto.gestion) {
        throw new BadRequestException(
          'Para registrar un Delegado, es obligatorio seleccionar la Carrera e ingresar la Gestión.',
        );
      }
    }

    const nuevoUsuario = await this.usersService.create(createUserDto);

    return {
      message: 'Usuario registrado exitosamente en el sistema',
      user: {
        email: nuevoUsuario.email,
        id_rol: nuevoUsuario.id_rol,
      },
    };
  }
}
