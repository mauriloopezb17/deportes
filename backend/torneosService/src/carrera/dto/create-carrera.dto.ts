import { IsString, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCarreraDto {
  @ApiProperty({ description: "Nombre de la carrera" })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  nombre: string;
}
