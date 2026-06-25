import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { FixtureService } from "./fixture.service";
import { CreateFixtureDto } from "./dto/create-fixture.dto";
import { GenerateFixtureDto } from "./dto/generate-fixture.dto";
import { UpdateFixtureDto } from "./dto/update-fixture.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Fixtures")
@Controller("fixture")
export class FixtureController {
  constructor(private readonly fixtureService: FixtureService) {}

  @Post()
  @ApiOperation({ summary: "Crear partido" })
  @ApiResponse({ status: 201, description: "Partido creado exitosamente" })
  create(@Body() createFixtureDto: CreateFixtureDto) {
    return this.fixtureService.create(createFixtureDto);
  }

  @Post("generar")
  @ApiOperation({ summary: "Generar fixture automatico" })
  @ApiResponse({ status: 201, description: "Fixture generado exitosamente" })
  generate(@Body() generateFixtureDto: GenerateFixtureDto) {
    return this.fixtureService.generate(generateFixtureDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los partidos" })
  findAll() {
    return this.fixtureService.findAll();
  }

  @Get("torneo/:torneoId")
  @ApiOperation({ summary: "Obtener partidos de un torneo" })
  findByTorneo(@Param("torneoId") torneoId: string) {
    return this.fixtureService.findByTorneo(+torneoId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un partido por ID" })
  findOne(@Param("id") id: string) {
    return this.fixtureService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un partido" })
  update(@Param("id") id: string, @Body() updateFixtureDto: UpdateFixtureDto) {
    return this.fixtureService.update(+id, updateFixtureDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un partido" })
  remove(@Param("id") id: string) {
    return this.fixtureService.remove(+id);
  }
}
