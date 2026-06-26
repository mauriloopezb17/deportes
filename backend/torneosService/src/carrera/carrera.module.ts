import { Module } from "@nestjs/common";
import { CarreraService } from "./carrera.service";
import { CarreraController } from "./carrera.controller";

@Module({
  controllers: [CarreraController],
  providers: [CarreraService],
  exports: [CarreraService],
})
export class CarreraModule {}
