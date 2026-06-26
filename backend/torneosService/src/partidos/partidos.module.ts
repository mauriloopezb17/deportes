import { Module } from "@nestjs/common";
import { DisciplinaModule } from "../disciplina/disciplina.module";
import { FixtureModule } from "../fixture/fixture.module";
import { TorneoModule } from "../torneo/torneo.module";
import { PartidosController } from "./partidos.controller";

@Module({
  imports: [FixtureModule, TorneoModule, DisciplinaModule],
  controllers: [PartidosController],
})
export class PartidosModule {}
