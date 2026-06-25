import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDateString,
  IsIn,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTorneoDto {
  @ApiProperty({ description: "Nombre del torneo" })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ description: "Tipo de torneo (Interno o Externo)" })
  @IsIn(["Interno", "Externo"])
  tipo: string;

  @ApiProperty({ description: "Estado del torneo", required: false })
  @IsOptional()
  @IsIn(["planeado", "en_curso", "finalizado"])
  estado?: string;

  @ApiProperty({ description: "ID de la disciplina" })
  @IsInt()
  @Min(1)
  disciplina_id: number;

  @ApiProperty({ description: "Fecha de inicio", required: false })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiProperty({ description: "Fecha de fin", required: false })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiProperty({ description: "URL de la imagen", required: false })
  @IsOptional()
  @IsUrl()
  imagen_url?: string;
}
