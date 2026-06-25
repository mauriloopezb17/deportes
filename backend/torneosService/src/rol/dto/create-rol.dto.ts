import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRolDto {
  @ApiProperty({ description: "Nombre del rol" })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
