import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
} from "@nestjs/common";
import { EspaciosService } from "./espacios.service";

@Controller("espacios")
export class EspaciosController {
  constructor(private readonly espaciosService: EspaciosService) {}

  @Get()
  findAll() {
    return this.espaciosService.findAll();
  }

  @Get("rango-horario")
  rangoHorario() {
    return this.espaciosService.getRangoHorario();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const espacio = await this.espaciosService.findOne(id);
    if (!espacio)
      throw new NotFoundException(`No existe el espacio con id ${id}`);
    return espacio;
  }
}
