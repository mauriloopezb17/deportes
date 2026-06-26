import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFixtureDto {
  @ApiProperty({ description: "ID del torneo" })
  @IsInt()
  @Min(1)
  torneo_id: number;

  @ApiProperty({ description: "Numero de ronda" })
  @IsInt()
  @Min(1)
  ronda: number;

  @ApiProperty({ description: "ID del equipo local", required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  equipo_local_id?: number;

  @ApiProperty({ description: "ID del equipo visitante", required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  equipo_visitante_id?: number;

  @ApiProperty({ description: "Fecha y hora del partido", required: false })
  @IsOptional()
  @IsDateString()
  fecha_hora?: string;

  @ApiProperty({ description: "Nombre del estadio", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  estadio?: string;

  @ApiProperty({ description: "Resultado del equipo local", required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  resultado_local?: number;

  @ApiProperty({
    description: "Resultado del equipo visitante",
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  resultado_visitante?: number;

  @ApiProperty({ description: "ID del siguiente partido", required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  next_match_id?: number;
}
