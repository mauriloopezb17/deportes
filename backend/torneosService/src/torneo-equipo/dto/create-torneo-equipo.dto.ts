import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTorneoEquipoDto {
  @ApiProperty({ description: "ID del torneo" })
  @IsNumber()
  torneo_id: number;

  @ApiProperty({ description: "ID del equipo" })
  @IsNumber()
  equipo_id: number;
}
