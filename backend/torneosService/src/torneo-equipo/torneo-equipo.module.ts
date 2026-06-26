import { Module } from "@nestjs/common";
import { TorneoEquipoService } from "./torneo-equipo.service";
import { TorneoEquipoController } from "./torneo-equipo.controller";

@Module({
  controllers: [TorneoEquipoController],
  providers: [TorneoEquipoService],
  exports: [TorneoEquipoService],
})
export class TorneoEquipoModule {}
