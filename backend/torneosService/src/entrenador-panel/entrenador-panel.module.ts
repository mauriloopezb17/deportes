import { Module } from "@nestjs/common";
import { EntrenadorPanelController } from "./entrenador-panel.controller";
import { EntrenadorPanelService } from "./entrenador-panel.service";

@Module({
  controllers: [EntrenadorPanelController],
  providers: [EntrenadorPanelService],
})
export class EntrenadorPanelModule {}
