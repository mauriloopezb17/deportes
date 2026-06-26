import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { TorneoEquipoService } from "./torneo-equipo.service";
import { CreateTorneoEquipoDto } from "./dto/create-torneo-equipo.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Torneo-Equipos")
@Controller("torneo-equipo")
export class TorneoEquipoController {
  constructor(private readonly torneoEquipoService: TorneoEquipoService) {}

  @Post()
  @ApiOperation({ summary: "Agregar equipo a torneo" })
  @ApiResponse({ status: 201, description: "Equipo agregado al torneo" })
  create(@Body() createTorneoEquipoDto: CreateTorneoEquipoDto) {
    return this.torneoEquipoService.create(createTorneoEquipoDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos" })
  findAll() {
    return this.torneoEquipoService.findAll();
  }

  @Get("torneo/:torneoId")
  @ApiOperation({ summary: "Obtener equipos de un torneo" })
  findByTorneo(@Param("torneoId") torneoId: string) {
    return this.torneoEquipoService.findByTorneo(+torneoId);
  }

  @Delete(":torneoId/:equipoId")
  @ApiOperation({ summary: "Eliminar equipo de torneo" })
  remove(
    @Param("torneoId") torneoId: string,
    @Param("equipoId") equipoId: string,
  ) {
    return this.torneoEquipoService.remove(+torneoId, +equipoId);
  }
}
