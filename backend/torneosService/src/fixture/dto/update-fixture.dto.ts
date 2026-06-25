import { PartialType } from "@nestjs/mapped-types";
import { CreateFixtureDto } from "./create-fixture.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateFixtureDto extends PartialType(CreateFixtureDto) {
  @ApiProperty({ description: "ID del torneo" })
  torneo_id?: number;

  @ApiProperty({ description: "Número de ronda" })
  ronda?: number;

  @ApiProperty({ description: "ID del equipo local" })
  equipo_local_id?: number;

  @ApiProperty({ description: "ID del equipo visitante" })
  equipo_visitante_id?: number;

  @ApiProperty({ description: "Fecha y hora del partido" })
  fecha_hora?: string;

  @ApiProperty({ description: "Nombre del estadio" })
  estadio?: string;

  @ApiProperty({ description: "Resultado del equipo local" })
  resultado_local?: number;

  @ApiProperty({ description: "Resultado del equipo visitante" })
  resultado_visitante?: number;

  @ApiProperty({ description: "ID del siguiente partido" })
  next_match_id?: number;
}
