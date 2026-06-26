import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ReservaService } from "./reserva.service";
import { CreateReservaDto } from "./dto/create-reserva.dto";
import { UpdateReservaDto } from "./dto/update-reserva.dto";

@Controller("reserva")
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  create(@Body() data: CreateReservaDto) {
    return this.reservaService.create(data);
  }

  @Get()
  findAll(@Query("fecha") fecha?: string, @Query("equipoId") equipoId?: string) {
    return this.reservaService.findAll(fecha, equipoId ? +equipoId : undefined);
  }

  @Get("disponibilidad/:canchaId/:fecha")
  disponibilidad() {
    return [];
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.reservaService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() data: UpdateReservaDto) {
    return this.reservaService.update(+id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.reservaService.remove(+id);
  }
}
