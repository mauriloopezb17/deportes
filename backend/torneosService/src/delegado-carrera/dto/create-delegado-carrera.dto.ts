import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDelegadoCarreraDto {
  @ApiProperty({ description: "ID de la persona (delegado)" })
  @IsNumber()
  persona_id: number;

  @ApiProperty({ description: "ID de la carrera" })
  @IsNumber()
  carrera_id: number;
}
