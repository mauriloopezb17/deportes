import { Controller, Get } from '@nestjs/common';
import { DeportistasService } from './deportistas.service';

@Controller('api/deportistas')
export class DeportistasController {
  constructor(private readonly deportistasService: DeportistasService) {}

  @Get('destacados')
  async obtenerDestacados() {
    return this.deportistasService.obtenerJugadoresDestacados();
  }
}
