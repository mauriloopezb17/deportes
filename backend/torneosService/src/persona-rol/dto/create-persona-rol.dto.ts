import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePersonaRolDto {
  @ApiProperty({ description: "ID de la persona" })
  @IsNumber()
  persona_id: number;

  @ApiProperty({ description: "ID del rol" })
  @IsNumber()
  rol_id: number;
}
