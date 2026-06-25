import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GenerateFixtureDto {
  @ApiProperty({ description: "ID del torneo" })
  @IsInt()
  @Min(1)
  torneo_id: number;

  @ApiProperty({ description: "Fecha inicial para programar", required: false })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiProperty({ description: "Hora de inicio del dia", required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  hora_inicio?: string;

  @ApiProperty({ description: "Hora limite del dia", required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  hora_fin?: string;

  @ApiProperty({ description: "Duracion de cada partido en minutos", required: false })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  duracion_minutos?: number;

  @ApiProperty({ description: "IDs de espacios/canchas disponibles", required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  espacio_ids?: number[];

  @ApiProperty({ description: "Eliminar fixture anterior del torneo", required: false })
  @IsOptional()
  @IsBoolean()
  reemplazar_existente?: boolean;
}
