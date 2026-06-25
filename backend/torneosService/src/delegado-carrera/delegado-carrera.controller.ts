import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { DelegadoCarreraService } from "./delegado-carrera.service";
import { CreateDelegadoCarreraDto } from "./dto/create-delegado-carrera.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Delegados-Carrera")
@Controller("delegado-carrera")
export class DelegadoCarreraController {
  constructor(
    private readonly delegadoCarreraService: DelegadoCarreraService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Asignar delegado a carrera" })
  @ApiResponse({ status: 201, description: "Delegado asignado exitosamente" })
  create(@Body() createDelegadoCarreraDto: CreateDelegadoCarreraDto) {
    return this.delegadoCarreraService.create(createDelegadoCarreraDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los delegados" })
  findAll() {
    return this.delegadoCarreraService.findAll();
  }

  @Get("carrera/:carreraId")
  @ApiOperation({ summary: "Obtener delegado de una carrera" })
  findByCarrera(@Param("carreraId") carreraId: string) {
    return this.delegadoCarreraService.findByCarrera(+carreraId);
  }

  @Delete(":personaId/:carreraId")
  @ApiOperation({ summary: "Eliminar delegado de carrera" })
  remove(
    @Param("personaId") personaId: string,
    @Param("carreraId") carreraId: string,
  ) {
    return this.delegadoCarreraService.remove(+personaId, +carreraId);
  }
}
