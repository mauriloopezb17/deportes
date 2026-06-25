import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateJugadorEquipoDto {
  @ApiProperty({ description: "ID del jugador (persona)" })
  @IsNumber()
  jugador_id: number;

  @ApiProperty({ description: "ID del equipo" })
  @IsNumber()
  equipo_id: number;
}
