import { Module } from "@nestjs/common";
import { DelegadoCarreraService } from "./delegado-carrera.service";
import { DelegadoCarreraController } from "./delegado-carrera.controller";

@Module({
  controllers: [DelegadoCarreraController],
  providers: [DelegadoCarreraService],
  exports: [DelegadoCarreraService],
})
export class DelegadoCarreraModule {}
