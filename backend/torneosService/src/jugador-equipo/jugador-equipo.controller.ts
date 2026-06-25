import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { JugadorEquipoService } from "./jugador-equipo.service";
import { CreateJugadorEquipoDto } from "./dto/create-jugador-equipo.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Jugadores-Equipos")
@Controller("jugador-equipo")
export class JugadorEquipoController {
  constructor(private readonly jugadorEquipoService: JugadorEquipoService) {}

  @Post()
  @ApiOperation({ summary: "Agregar jugador a equipo" })
  @ApiResponse({ status: 201, description: "Jugador agregado al equipo" })
  create(@Body() createJugadorEquipoDto: CreateJugadorEquipoDto) {
    return this.jugadorEquipoService.create(createJugadorEquipoDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las relaciones" })
  findAll() {
    return this.jugadorEquipoService.findAll();
  }

  @Get("equipo/:equipoId")
  @ApiOperation({ summary: "Obtener jugadores de un equipo" })
  findByEquipo(@Param("equipoId") equipoId: string) {
    return this.jugadorEquipoService.findByEquipo(+equipoId);
  }

  @Get("jugador/:jugadorId")
  @ApiOperation({ summary: "Obtener equipos de un jugador" })
  findByJugador(@Param("jugadorId") jugadorId: string) {
    return this.jugadorEquipoService.findByJugador(+jugadorId);
  }

  @Delete(":jugadorId/:equipoId")
  @ApiOperation({ summary: "Eliminar jugador de equipo" })
  remove(
    @Param("jugadorId") jugadorId: string,
    @Param("equipoId") equipoId: string,
  ) {
    return this.jugadorEquipoService.remove(+jugadorId, +equipoId);
  }
}
