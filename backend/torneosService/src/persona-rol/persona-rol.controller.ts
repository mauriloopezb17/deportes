import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { PersonaRolService } from "./persona-rol.service";
import { CreatePersonaRolDto } from "./dto/create-persona-rol.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Persona-Rol")
@Controller("persona-rol")
export class PersonaRolController {
  constructor(private readonly personaRolService: PersonaRolService) {}

  @Post()
  @ApiOperation({ summary: "Asignar rol a persona" })
  @ApiResponse({ status: 201, description: "Rol asignado exitosamente" })
  create(@Body() createPersonaRolDto: CreatePersonaRolDto) {
    return this.personaRolService.create(createPersonaRolDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las relaciones" })
  findAll() {
    return this.personaRolService.findAll();
  }

  @Get("persona/:personaId")
  @ApiOperation({ summary: "Obtener roles de una persona" })
  findByPersona(@Param("personaId") personaId: string) {
    return this.personaRolService.findByPersona(+personaId);
  }

  @Delete(":personaId/:rolId")
  @ApiOperation({ summary: "Eliminar rol de persona" })
  remove(@Param("personaId") personaId: string, @Param("rolId") rolId: string) {
    return this.personaRolService.remove(+personaId, +rolId);
  }
}
