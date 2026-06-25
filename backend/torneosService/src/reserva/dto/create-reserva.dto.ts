import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

export class CreateReservaDto {
  @IsInt()
  @Min(1)
  cancha_id: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  equipo_id?: number;

  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "La hora de inicio debe usar formato HH:mm",
  })
  hora_inicio: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "La hora de fin debe usar formato HH:mm",
  })
  hora_fin: string;

  @IsIn(["confirmada", "pendiente", "cancelada"])
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  observaciones?: string;
}
