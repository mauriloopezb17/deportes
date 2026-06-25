import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePersonaDto {
  @ApiProperty({ description: "Nombre de la persona" })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  nombre: string;

  @ApiProperty({ description: "Apellido de la persona" })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  apellido: string;

  @ApiProperty({ description: "Número de carnet" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5,10}$/, {
    message: "El carnet debe tener entre 5 y 10 digitos",
  })
  carnet: string;

  @ApiProperty({ description: "Email institucional @ucb.edu.bo" })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/@ucb\.edu\.bo$/, {
    message: "El email debe ser del dominio @ucb.edu.bo",
  })
  email: string;

  @ApiProperty({ description: "Número de celular" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,12}$/, {
    message: "El celular debe contener entre 7 y 12 digitos",
  })
  celular: string;
}
