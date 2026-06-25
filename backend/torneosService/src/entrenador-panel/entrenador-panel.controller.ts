import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { EntrenadorPanelService } from "./entrenador-panel.service";
import { RegistrarPartidoEntrenadorDto } from "./dto/registrar-partido-entrenador.dto";

@ApiTags("Panel Entrenador")
@ApiBearerAuth("JWT-auth")
@Roles("ENTRENADOR")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("entrenador-panel")
export class EntrenadorPanelController {
  constructor(private readonly entrenadorPanelService: EntrenadorPanelService) {}

  @Get("resumen")
  @ApiOperation({ summary: "Resumen del entrenador autenticado" })
  getResumen(@Request() req: any) {
    return this.entrenadorPanelService.getResumen(req.user.id);
  }

  @Get("partidos-pendientes")
  @ApiOperation({ summary: "Partidos pendientes de la disciplina del entrenador" })
  getPartidosPendientes(@Request() req: any) {
    return this.entrenadorPanelService.getPartidosPendientes(req.user.id);
  }

  @Get("partidos/:id")
  @ApiOperation({ summary: "Detalle de partido para registrar datos" })
  getPartido(@Request() req: any, @Param("id") id: string) {
    return this.entrenadorPanelService.getPartido(req.user.id, +id);
  }

  @Post("partidos/:id/registro")
  @ApiOperation({ summary: "Registrar resultado, anotadores y faltas" })
  registrarPartido(
    @Request() req: any,
    @Param("id") id: string,
    @Body() data: RegistrarPartidoEntrenadorDto,
  ) {
    return this.entrenadorPanelService.registrarPartido(req.user.id, +id, data);
  }
}
