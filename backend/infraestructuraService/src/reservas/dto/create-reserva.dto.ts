import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsDateString,
  Matches,
  MinLength,
  MaxLength,
  IsEmail,
} from "class-validator";
import { Type } from "class-transformer";

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateReservaDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  espacio_id!: number;

  @IsDateString()
  fecha_reserva!: string;

  @IsString()
  @Matches(HORA_REGEX, { message: "hora_inicio debe ser una hora válida en formato HH:MM" })
  hora_inicio!: string;

  @IsString()
  @Matches(HORA_REGEX, { message: "hora_fin debe ser una hora válida en formato HH:MM" })
  hora_fin!: string;

  @IsString()
  tipo_reserva!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  motivo?: string;

  @IsString()
  @MinLength(2)
  nombre_solicitante!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ci!: number;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsEmail({}, { message: "correo_solicitante debe ser un email válido" })
  @Matches(/@ucb\.edu\.bo$/, {
    message: 'El email es inválido. Debe ser un correo institucional de la universidad (@ucb.edu.bo)',
  })
  correo_solicitante?: string;
}
