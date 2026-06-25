import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { PersonaService } from "./persona.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { UpdatePersonaDto } from "./dto/update-persona.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Personas")
@Controller("persona")
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  @ApiOperation({ summary: "Crear persona" })
  @ApiResponse({ status: 201, description: "Persona creada exitosamente" })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personaService.create(createPersonaDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las personas" })
  findAll() {
    return this.personaService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una persona por ID" })
  findOne(@Param("id") id: string) {
    return this.personaService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar una persona" })
  update(@Param("id") id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personaService.update(+id, updatePersonaDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una persona" })
  remove(@Param("id") id: string) {
    return this.personaService.remove(+id);
  }
}
