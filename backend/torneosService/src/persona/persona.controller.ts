import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PersonaService } from "./persona.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { UpdatePersonaDto } from "./dto/update-persona.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("Personas")
@Controller("persona")
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Crear persona" })
  @ApiResponse({ status: 201, description: "Persona creada exitosamente" })
  create(@Body() createPersonaDto: CreatePersonaDto, @Req() req: any) {
    return this.personaService.create(createPersonaDto, req.user);
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
