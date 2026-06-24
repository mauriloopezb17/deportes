import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { InscribirDeportistaDto } from './dto/inscribir-deportista.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'Administrador')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('catalogos/inscripcion')
  async obtenerCatalogosInscripcion() {
    return this.adminService.getCatalogosFormulario();
  }

  @Post('deportistas/inscribir')
  async inscribirDeportista(@Body() data: InscribirDeportistaDto) {
    return this.adminService.inscribirDeportistaExterno(data);
  }

  @Get('roles')
  async listarRoles() {
    return this.adminService.obtenerTodosLosRoles();
  }

  @Post('usuarios/registrar')
  async crearUsuario(@Body() data: CrearUsuarioDto) {
    return this.adminService.registrarUsuarioSistema(data);
  }

  @Get('carreras')
  async listarCarreras() {
    return this.adminService.getCarreras();
  }

  @Get('deportistas')
  async listarDeportistas() {
    return this.adminService.getListaDeportistas();
  }

  @Patch('deportistas/:id/estado')
  async cambiarEstadoDeportista(@Param('id', ParseIntPipe) id: number) {
    const actualizados = await this.adminService.alternarEstadoDeportista(id);

    if (actualizados.length === 0) {
      throw new NotFoundException(
        'No se encontraron inscripciones para este deportista',
      );
    }

    return {
      message: 'Estado actualizado correctamente',
      nuevo_estado: actualizados[0].estado,
    };
  }
}
