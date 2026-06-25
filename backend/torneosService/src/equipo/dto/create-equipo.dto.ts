import {
  IsString,
  IsNotEmpty,
  IsInt,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEquipoDto {
  @ApiProperty({ description: "Nombre del equipo" })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nombre_equipo: string;

  @ApiProperty({ description: "ID de la carrera" })
  @IsInt()
  @Min(1)
  carrera_id: number;

  @ApiProperty({ description: "ID de la disciplina" })
  @IsInt()
  @Min(1)
  disciplina_id: number;
}
