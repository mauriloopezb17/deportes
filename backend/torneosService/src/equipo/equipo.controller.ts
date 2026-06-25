import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { EquipoService } from "./equipo.service";
import { CreateEquipoDto } from "./dto/create-equipo.dto";
import { UpdateEquipoDto } from "./dto/update-equipo.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Equipos")
@Controller("equipo")
export class EquipoController {
  constructor(private readonly equipoService: EquipoService) {}

  @Post()
  @ApiOperation({ summary: "Crear equipo" })
  @ApiResponse({ status: 201, description: "Equipo creado exitosamente" })
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equipoService.create(createEquipoDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los equipos" })
  findAll() {
    return this.equipoService.findAll();
  }

  @Get("buscar/carrera/:carreraId/disciplina/:disciplinaId")
  @ApiOperation({ summary: "Buscar equipo por carrera y disciplina" })
  findByCarreraAndDisciplina(
    @Param("carreraId") carreraId: string,
    @Param("disciplinaId") disciplinaId: string,
  ) {
    return this.equipoService.findByCarreraAndDisciplina(
      +carreraId,
      +disciplinaId,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un equipo por ID" })
  findOne(@Param("id") id: string) {
    return this.equipoService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un equipo" })
  update(@Param("id") id: string, @Body() updateEquipoDto: UpdateEquipoDto) {
    return this.equipoService.update(+id, updateEquipoDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un equipo" })
  remove(@Param("id") id: string) {
    return this.equipoService.remove(+id);
  }
}
