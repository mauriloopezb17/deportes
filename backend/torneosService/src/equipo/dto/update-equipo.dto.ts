import { PartialType } from "@nestjs/mapped-types";
import { CreateEquipoDto } from "./create-equipo.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {
  @ApiProperty({ description: "Nombre del equipo" })
  nombre_equipo?: string;

  @ApiProperty({ description: "ID de la carrera" })
  carrera_id?: number;

  @ApiProperty({ description: "ID de la disciplina" })
  disciplina_id?: number;
}
