import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { DisciplinaService } from "./disciplina.service";
import { CreateDisciplinaDto } from "./dto/create-disciplina.dto";
import { UpdateDisciplinaDto } from "./dto/update-disciplina.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Disciplinas")
@Controller("disciplina")
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  @Post()
  @ApiOperation({ summary: "Crear disciplina" })
  @ApiResponse({ status: 201, description: "Disciplina creada exitosamente" })
  create(@Body() createDisciplinaDto: CreateDisciplinaDto) {
    return this.disciplinaService.create(createDisciplinaDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las disciplinas" })
  findAll() {
    return this.disciplinaService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una disciplina por ID" })
  findOne(@Param("id") id: string) {
    return this.disciplinaService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar una disciplina" })
  update(
    @Param("id") id: string,
    @Body() updateDisciplinaDto: UpdateDisciplinaDto,
  ) {
    return this.disciplinaService.update(+id, updateDisciplinaDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una disciplina" })
  remove(@Param("id") id: string) {
    return this.disciplinaService.remove(+id);
  }
}
