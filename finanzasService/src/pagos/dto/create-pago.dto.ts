import {
  IsInt,
  IsPositive,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsISO8601,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export class CreatePagoDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_persona_pago!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_deportista_beneficiario!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_concepto!: number;

  @IsString()
  @IsNotEmpty({ message: "id_transaccion_caja es obligatorio" })
  id_transaccion_caja!: string;

  @IsNumber()
  @IsPositive({ message: "monto_pagado debe ser mayor a 0" })
  monto_pagado!: number;

  @IsISO8601({ strict: true }, { message: "fecha_pago debe ser una fecha ISO válida" })
  fecha_pago!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(12)
  mes_correspondiente!: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000, { message: "gestión fuera de rango" })
  @Max(2100, { message: "gestión fuera de rango" })
  gestion!: number;
}
