import { IsString, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDisciplinaDto {
  @ApiProperty({ description: "Nombre de la disciplina" })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(80)
  nombre: string;
}
