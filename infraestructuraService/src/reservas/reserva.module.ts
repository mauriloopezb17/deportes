import { Module } from "@nestjs/common";
import { ReservasController } from "./reserva.controller";
import { ReservasService } from "./reservas.service";
import { ReportesHelper } from "../common/helpers/reportes.helper";

@Module({
  controllers: [ReservasController],
  providers: [ReservasService, ReportesHelper],
})
export class ReservasModule {}
