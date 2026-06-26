import { PartialType } from "@nestjs/mapped-types";
import { CreatePersonaDto } from "./create-persona.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {
  @ApiProperty({ description: "Nombre de la persona" })
  nombre?: string;

  @ApiProperty({ description: "Apellido de la persona" })
  apellido?: string;

  @ApiProperty({ description: "Número de carnet" })
  carnet?: string;

  @ApiProperty({ description: "Email" })
  email?: string;

  @ApiProperty({ description: "Número de celular" })
  celular?: string;
}
