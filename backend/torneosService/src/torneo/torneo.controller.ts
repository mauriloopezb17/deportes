import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { TorneoService } from "./torneo.service";
import { CreateTorneoDto } from "./dto/create-torneo.dto";
import { UpdateTorneoDto } from "./dto/update-torneo.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Torneos")
@Controller("torneo")
export class TorneoController {
  constructor(private readonly torneoService: TorneoService) {}

  @Post()
  @ApiOperation({ summary: "Crear torneo" })
  @ApiResponse({ status: 201, description: "Torneo creado exitosamente" })
  create(@Body() createTorneoDto: CreateTorneoDto) {
    return this.torneoService.create(createTorneoDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los torneos" })
  findAll() {
    return this.torneoService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un torneo por ID" })
  findOne(@Param("id") id: string) {
    return this.torneoService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un torneo" })
  update(@Param("id") id: string, @Body() updateTorneoDto: UpdateTorneoDto) {
    return this.torneoService.update(+id, updateTorneoDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un torneo" })
  remove(@Param("id") id: string) {
    return this.torneoService.remove(+id);
  }
}
