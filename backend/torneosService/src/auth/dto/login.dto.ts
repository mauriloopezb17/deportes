import { IsString, IsNotEmpty, IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ description: "Email del usuario" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Contraseña" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
