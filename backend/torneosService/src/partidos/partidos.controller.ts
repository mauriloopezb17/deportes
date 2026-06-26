import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DisciplinaService } from "../disciplina/disciplina.service";
import { FixtureService } from "../fixture/fixture.service";
import { TorneoService } from "../torneo/torneo.service";

@ApiTags("Partidos")
@Controller("partidos")
export class PartidosController {
  constructor(
    private readonly fixtureService: FixtureService,
    private readonly torneoService: TorneoService,
    private readonly disciplinaService: DisciplinaService,
  ) {}

  @Get("fixture/:idTorneo")
  @ApiOperation({ summary: "Obtener el fixture de un torneo" })
  getFixture(@Param("idTorneo", ParseIntPipe) idTorneo: number) {
    return this.fixtureService.findByTorneo(idTorneo);
  }

  @Get("torneos")
  @ApiOperation({ summary: "Listar todos los torneos" })
  getTorneos() {
    return this.torneoService.findAll();
  }

  @Get("disciplinas")
  @ApiOperation({ summary: "Listar todas las disciplinas deportivas" })
  getDisciplinas() {
    return this.disciplinaService.findAll();
  }

  @Get("torneo/:idTorneo")
  @ApiOperation({ summary: "Obtener todos los partidos de un torneo" })
  getPartidosPorTorneo(
    @Param("idTorneo", ParseIntPipe) idTorneo: number,
  ) {
    return this.fixtureService.findByTorneo(idTorneo);
  }
}
