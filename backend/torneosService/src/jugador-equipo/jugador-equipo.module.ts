import { Module } from "@nestjs/common";
import { JugadorEquipoService } from "./jugador-equipo.service";
import { JugadorEquipoController } from "./jugador-equipo.controller";

@Module({
  controllers: [JugadorEquipoController],
  providers: [JugadorEquipoService],
  exports: [JugadorEquipoService],
})
export class JugadorEquipoModule {}
