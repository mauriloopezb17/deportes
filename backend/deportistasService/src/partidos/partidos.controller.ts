import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PartidosService } from './partidos.service';

@Controller('api/partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Get('recientes')
  async obtenerResultadosRecientes() {
    return this.partidosService.getResultadosRecientes();
  }

  @Get('fixture/:idTorneo')
  async obtenerFixtureTorneo(
    @Param('idTorneo', ParseIntPipe) idTorneo: number,
  ) {
    return this.partidosService.getFixturePorTorneo(idTorneo);
  }

  @Get('torneos')
  async listarTorneos() {
    return this.partidosService.getTorneos();
  }

  @Get('disciplinas')
  async listarDisciplinas() {
    return this.partidosService.getDisciplinas();
  }

  @Get('resultados')
  async obtenerResultados() {
    return this.partidosService.getResultadosGenerales();
  }

  @Get('proximos')
  async obtenerProximosPartidos() {
    return this.partidosService.getProximosPartidosGenerales();
  }

  @Get('posiciones/:idTorneo')
  async obtenerTablaPosiciones(
    @Param('idTorneo', ParseIntPipe) idTorneo: number,
    @Query('disciplina') disciplina?: string,
  ) {
    const idDisciplina = disciplina ? parseInt(disciplina, 10) : undefined;
    return this.partidosService.getTablaPosiciones(idTorneo, idDisciplina);
  }

  @Get('torneo/:idTorneo')
  async obtenerPartidosTorneo(
    @Param('idTorneo', ParseIntPipe) idTorneo: number,
    @Query('disciplina') disciplina?: string,
  ) {
    const idDisciplina = disciplina ? parseInt(disciplina, 10) : undefined;
    return this.partidosService.getPartidosPorTorneo(idTorneo, idDisciplina);
  }

  @Get('goleadores/:idTorneo')
  async obtenerGoleadores(
    @Param('idTorneo', ParseIntPipe) idTorneo: number,
    @Query('disciplina') disciplina?: string,
  ) {
    const idDisciplina = disciplina ? parseInt(disciplina, 10) : undefined;
    return this.partidosService.getGoleadores(idTorneo, idDisciplina);
  }

  @Get('tarjetas/:idTorneo')
  async obtenerTarjetas(
    @Param('idTorneo', ParseIntPipe) idTorneo: number,
    @Query('disciplina') disciplina?: string,
  ) {
    const idDisciplina = disciplina ? parseInt(disciplina, 10) : undefined;
    return this.partidosService.getTarjetas(idTorneo, idDisciplina);
  }
}
