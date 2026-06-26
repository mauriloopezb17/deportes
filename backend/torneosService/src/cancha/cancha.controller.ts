import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CanchaService } from "./cancha.service";
import { CreateCanchaDto } from "./dto/create-cancha.dto";
import { UpdateCanchaDto } from "./dto/update-cancha.dto";

@Controller("cancha")
export class CanchaController {
  constructor(private readonly canchaService: CanchaService) {}

  @Post()
  create(@Body() data: CreateCanchaDto) {
    return this.canchaService.create(data);
  }

  @Get()
  findAll() {
    return this.canchaService.findAll();
  }

  @Get("rango-horario")
  getRangoHorario() {
    return this.canchaService.getRangoHorario();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.canchaService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateCanchaDto) {
    return this.canchaService.update(+id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.canchaService.remove(+id);
  }
}
