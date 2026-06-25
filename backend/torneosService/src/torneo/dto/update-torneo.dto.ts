import { PartialType } from "@nestjs/mapped-types";
import { CreateTorneoDto } from "./create-torneo.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateTorneoDto extends PartialType(CreateTorneoDto) {
  @ApiProperty({ description: "Nombre del torneo" })
  nombre?: string;

  @ApiProperty({ description: "Tipo de torneo" })
  tipo?: string;

  @ApiProperty({ description: "Estado del torneo" })
  estado?: string;

  @ApiProperty({ description: "ID de la disciplina" })
  disciplina_id?: number;

  @ApiProperty({ description: "Fecha de inicio" })
  fecha_inicio?: string;

  @ApiProperty({ description: "Fecha de fin" })
  fecha_fin?: string;

  @ApiProperty({ description: "URL de la imagen" })
  imagen_url?: string;
}
