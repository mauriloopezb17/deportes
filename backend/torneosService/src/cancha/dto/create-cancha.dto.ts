import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateCanchaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(80)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  ubicacion?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  capacidad?: number;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  tipo_superficie?: string;

  @IsIn(["disponible", "ocupada", "mantenimiento"])
  @IsOptional()
  estado?: string;
}
