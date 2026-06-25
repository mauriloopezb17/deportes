import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RolService } from "./rol.service";
import { CreateRolDto } from "./dto/create-rol.dto";
import { UpdateRolDto } from "./dto/update-rol.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Roles")
@Controller("rol")
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  @ApiOperation({ summary: "Crear rol" })
  @ApiResponse({ status: 201, description: "Rol creado exitosamente" })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolService.create(createRolDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los roles" })
  findAll() {
    return this.rolService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un rol por ID" })
  findOne(@Param("id") id: string) {
    return this.rolService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un rol" })
  update(@Param("id") id: string, @Body() updateRolDto: UpdateRolDto) {
    return this.rolService.update(+id, updateRolDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un rol" })
  remove(@Param("id") id: string) {
    return this.rolService.remove(+id);
  }
}
