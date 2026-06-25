import { IsInt, IsPositive, IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class AsignarPagoDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_deportista!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_concepto!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes_correspondiente!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  monto!: number;
}
