import { PartialType } from "@nestjs/mapped-types";
import { CreateCarreraDto } from "./create-carrera.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCarreraDto extends PartialType(CreateCarreraDto) {
  @ApiProperty({ description: "Nombre de la carrera" })
  nombre?: string;
}
