import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
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

  @ApiProperty({ description: "Numero de carnet" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5,10}$/, {
    message: "El carnet debe tener entre 5 y 10 digitos",
  })
  carnet: string;

  @ApiProperty({ description: "Email institucional @ucb.edu.bo" })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/@ucb\.edu\.bo$/i, {
    message: "El email debe ser del dominio @ucb.edu.bo",
  })
  email: string;

  @ApiProperty({ description: "Numero de celular" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,12}$/, {
    message: "El celular debe contener entre 7 y 12 digitos",
  })
  celular: string;

  @ApiProperty({ description: "Contrasena de acceso" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: "Rol inicial del usuario", required: false })
  @IsOptional()
  @IsString()
  @IsIn(["JUGADOR", "ADMIN", "ADMINISTRADOR", "DELEGADO"])
  rol?: string;
}
