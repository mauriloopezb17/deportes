import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Res,
  BadRequestException,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { Response, Request } from "express";
import { ReservasService } from "./reservas.service";
import { CreateReservaDto } from "./dto/create-reserva.dto";
import { UpdateReservaDto } from "./dto/update-reserva.dto";

import { ReportesHelper } from "../common/helpers/reportes.helper";
import { Roles } from "../auth/decorators/roles.decorator";
import { OptionalParseIntPipe } from "../common/pipes/optional-parse-int.pipe";

@Controller("reservas")
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class ReservasController {
  constructor(
    private readonly reservasService: ReservasService,
    private readonly reportesHelper: ReportesHelper
  ) {}

  @Get()
  @Roles("admin", "entrenador")
  findAll(
    @Query("espacioId", new OptionalParseIntPipe()) espacioId?: number,
    @Query("fecha") fecha?: string,
    @Query("page", new OptionalParseIntPipe()) page?: number,
    @Query("limit", new OptionalParseIntPipe()) limit?: number,
    @Query("estado") estado?: string,
    @Query("busqueda") busqueda?: string,
  ) {
    return this.reservasService.findAll(espacioId, fecha, page, limit, estado, busqueda);
  }

  @Get("reporte")
  @Roles("admin")
  async descargarReporte(
    @Query("formato") formato: "pdf" | "excel",
    @Res() res: Response,
    @Query("desde") desde?: string,
    @Query("hasta") hasta?: string,
    @Query("estado") estado?: string,
  ) {
    if (formato !== "pdf" && formato !== "excel") {
      throw new BadRequestException("El formato debe ser 'pdf' o 'excel'");
    }

    const reservas = await this.reservasService.getReservasForReport({ desde, hasta, estado });

    const datosFormateados = reservas.map((r: any) => ({
      id: r.id_reserva,
      solicitante: r.nombre_solicitante,
      espacio: r.espacio_nombre,
      fecha: r.fecha_reserva ? new Date(r.fecha_reserva).toLocaleDateString("es-BO") : "N/A",
      horario: `${r.hora_inicio} - ${r.hora_fin}`,
      motivo: r.motivo,
      estado: r.estado,
    }));

    const columnas = [
      { header: "ID", key: "id" },
      { header: "Solicitante", key: "solicitante" },
      { header: "Espacio", key: "espacio" },
      { header: "Fecha", key: "fecha" },
      { header: "Horario", key: "horario" },
      { header: "Motivo", key: "motivo" },
      { header: "Estado", key: "estado" },
    ];

    const titulo = "Reporte de Reservas de Espacios UCB";
    let buffer: Buffer;

    if (formato === "excel") {
      buffer = await this.reportesHelper.generarExcel(titulo, columnas, datosFormateados);
      res.set({
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=reporte_reservas.xlsx",
      });
    } else {
      buffer = await this.reportesHelper.generarPdfTabla(titulo, columnas, datosFormateados);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=reporte_reservas.pdf",
      });
    }

    res.send(buffer);
  }

  @Get(":id")
  @Roles("admin", "entrenador")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.reservasService.findOne(id);
  }

  @Get(":id/comprobante")
  @Roles("admin", "entrenador")
  async descargarComprobante(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.reservasService.obtenerComprobante(id);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=comprobante-reserva-${id}.pdf`,
      "Content-Length": buffer.length.toString(),
    });

    res.end(buffer);
  }

  @Post()
  @Roles("admin", "entrenador")
  create(@Body() dto: CreateReservaDto, @Req() req: Request) {
    const idAprobador = (req as any).user?.id;
    if (!idAprobador) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.reservasService.create(dto, idAprobador);
  }

  @Patch(":id")
  @Roles("admin", "entrenador")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateReservaDto) {
    return this.reservasService.update(id, dto);
  }
}
