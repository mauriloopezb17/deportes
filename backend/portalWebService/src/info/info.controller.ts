import { Controller, Get } from '@nestjs/common';
import { InfoService } from './info.service';

@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('entrenadores')
  async obtenerEntrenadores() {
    return this.infoService.getEntrenadores();
  }

  @Get('horarios')
  async obtenerHorarios() {
    return this.infoService.getHorarios();
  }

  @Get('galeria-eventos')
  async obtenerGaleriaClub() {
    return this.infoService.getGaleriaEventos();
  }

  @Get('espacios')
  async obtenerEspacios() {
    return this.infoService.getEspacios();
  }
}
