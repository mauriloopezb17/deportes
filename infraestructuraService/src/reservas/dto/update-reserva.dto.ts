import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsPositive,
  Matches,
  IsEmail,
  MinLength,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { EstadoReserva } from "@prisma/client";

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class UpdateReservaDto {
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;

  @IsOptional()
  @IsDateString()
  fecha_reserva?: string;

  @IsOptional()
  @IsString()
  @Matches(HORA_REGEX, { message: "hora_inicio debe ser una hora válida en formato HH:MM" })
  hora_inicio?: string;

  @IsOptional()
  @IsString()
  @Matches(HORA_REGEX, { message: "hora_fin debe ser una hora válida en formato HH:MM" })
  hora_fin?: string;

  @IsOptional()
  @IsString()
  tipo_reserva?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre_solicitante?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ci?: number;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsEmail({}, { message: "correo_solicitante debe ser un email válido" })
  correo_solicitante?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  motivo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  espacio_id?: number;
}
