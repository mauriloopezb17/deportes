import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { CarreraService } from "./carrera.service";
import { CreateCarreraDto } from "./dto/create-carrera.dto";
import { UpdateCarreraDto } from "./dto/update-carrera.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Carreras")
@Controller("carrera")
export class CarreraController {
  constructor(private readonly carreraService: CarreraService) {}

  @Post()
  @ApiOperation({ summary: "Crear carrera" })
  @ApiResponse({ status: 201, description: "Carrera creada exitosamente" })
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carreraService.create(createCarreraDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las carreras" })
  findAll() {
    return this.carreraService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una carrera por ID" })
  findOne(@Param("id") id: string) {
    return this.carreraService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar una carrera" })
  update(@Param("id") id: string, @Body() updateCarreraDto: UpdateCarreraDto) {
    return this.carreraService.update(+id, updateCarreraDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una carrera" })
  remove(@Param("id") id: string) {
    return this.carreraService.remove(+id);
  }
}
