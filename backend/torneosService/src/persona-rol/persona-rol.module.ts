import { Module } from "@nestjs/common";
import { PersonaRolService } from "./persona-rol.service";
import { PersonaRolController } from "./persona-rol.controller";

@Module({
  controllers: [PersonaRolController],
  providers: [PersonaRolService],
  exports: [PersonaRolService],
})
export class PersonaRolModule {}
