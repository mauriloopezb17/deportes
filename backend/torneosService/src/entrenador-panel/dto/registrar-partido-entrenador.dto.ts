import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class EstadisticaJugadorDto {
  @ApiProperty({ description: "ID del deportista" })
  @IsInt()
  @Min(1)
  id_deportista: number;

  @ApiProperty({ description: "Puntos o goles anotados", required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  puntos_goles?: number;

  @ApiProperty({ description: "Tarjetas amarillas o faltas", required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  faltas_tarjetas_amarillas?: number;

  @ApiProperty({ description: "Tarjetas rojas", required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  faltas_tarjetas_rojas?: number;
}

export class RegistrarPartidoEntrenadorDto {
  @ApiProperty({ description: "Marcador del equipo local" })
  @IsInt()
  @Min(0)
  resultado_local: number;

  @ApiProperty({ description: "Marcador del equipo visitante" })
  @IsInt()
  @Min(0)
  resultado_visitante: number;

  @ApiProperty({ type: [EstadisticaJugadorDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstadisticaJugadorDto)
  estadisticas?: EstadisticaJugadorDto[];
}
