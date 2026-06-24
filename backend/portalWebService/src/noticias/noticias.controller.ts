import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { NoticiasService } from './noticias.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('noticias')
@UseInterceptors(CacheInterceptor)
export class NoticiasController {
  constructor(private readonly noticiasService: NoticiasService) {}

  @Get()
  @CacheKey('todas_las_noticias')
  @CacheTTL(60000)
  async getNoticias(@Query('publicado') publicado?: string) {
    const soloPublicados = publicado === 'true';
    return this.noticiasService.findAll(soloPublicados);
  }

  @Get('categorias')
  async getCategorias() {
    return this.noticiasService.getCategorias();
  }

  @Get(':id')
  async getNoticia(@Param('id') id: string) {
    const noticia = await this.noticiasService.findOne(+id);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }
    return noticia;
  }

  @Get('usuario/:id_usuario')
  async getNoticiasByUsuario(@Param('id_usuario') idUsuario: string) {
    return this.noticiasService.getNoticiasByUsuario(+idUsuario);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createNoticiaDto: CreateNoticiaDto, @Request() req) {
    const autorId = req.user?.id_usuario || 1;
    const result = await this.noticiasService.create(createNoticiaDto, autorId);
    return {
      message: 'Noticia creada con éxito',
      id_noticia: result.id_noticia,
      contenido: result.contenido,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateNoticiaDto: UpdateNoticiaDto,
  ) {
    const contenidoFinal = await this.noticiasService.update(
      +id,
      updateNoticiaDto,
    );
    return {
      message: 'Noticia actualizada con éxito',
      contenido: contenidoFinal,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const deleted = await this.noticiasService.remove(+id);
    if (!deleted) {
      throw new NotFoundException('Noticia no encontrada');
    }
    return { message: 'Noticia eliminada con éxito' };
  }
}
