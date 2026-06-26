import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { GaleriaService } from './galeria.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ajusta la ruta relativa si tu carpeta auth está en otro lado
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('galeria')
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  @Get()
  async obtenerGaleria(@Query('publicado') publicado?: string) {
    const soloPublicados = publicado === 'true';
    return this.galeriaService.getGaleria(soloPublicados);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async crearElementoGaleria(@Body() body: any, @Req() req: any) {
    const { url_archivo, tipo_archivo } = body;
    // req.user viene validado desde tu JwtStrategy
    const id_usuario_autor = req.user?.id_usuario;

    if (!url_archivo || !tipo_archivo) {
      throw new BadRequestException(
        'La URL del archivo y el tipo son obligatorios',
      );
    }

    const nuevoElemento = await this.galeriaService.createMedia(
      body,
      id_usuario_autor,
    );
    return { message: 'Elemento guardado en galería', data: nuevoElemento };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async actualizarElementoGaleria(@Param('id') id: string, @Body() body: any) {
    const actualizado = await this.galeriaService.updateMedia(
      parseInt(id, 10),
      body,
    );
    return { message: 'Elemento actualizado', data: actualizado };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async eliminarElementoGaleria(@Param('id') id: string) {
    await this.galeriaService.deleteMedia(parseInt(id, 10));
    return { message: 'Elemento eliminado correctamente' };
  }
}
