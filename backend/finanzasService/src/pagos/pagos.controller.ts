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
} from "@nestjs/common";
import { Response } from "express";
import { PagosService } from "./pagos.service";
import { PagosSyncService } from "./pagos-sync.service";
import { CreatePagoDto } from "./dto/create-pago.dto";
import { AsignarPagoDto } from "./dto/asignar-pago.dto";
import { ReportesService } from "../reportes/reportes.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { MESES_MAP } from "../common/constants/business.constants";
import { OptionalParseIntPipe } from "../common/pipes/optional-parse-int.pipe";

@Controller("pagos")
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
    private readonly pagosSyncService: PagosSyncService,
    private readonly reportesService: ReportesService,
  ) {}

  @Get()
  @Roles("admin", "entrenador")
  findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.pagosService.findAll(page, limit);
  }

  @Get("cuentas-academia")
  @Roles("admin", "entrenador")
  getCuentasAcademia(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("busqueda") busqueda?: string,
    @Query("disciplinaId", new ParseIntPipe({ optional: true })) disciplinaId?: number,
    @Query("mes", new ParseIntPipe({ optional: true })) mes?: number,
    @Query("anio", new ParseIntPipe({ optional: true })) anio?: number,
    @Query("estado") estado?: string,
  ) {
    return this.pagosService.getCuentasAcademia({ page, limit, busqueda, disciplinaId, mes, anio, estado });
  }

  @Get("conceptos")
  @Roles("admin", "entrenador")
  getConceptos(@Query("disciplinaId", new OptionalParseIntPipe()) disciplinaId?: number) {
    return this.pagosService.getConceptos(disciplinaId);
  }

  @Get("planilla")
  @Roles("admin", "entrenador")
  getPlanilla(
    @Query("disciplinaId", ParseIntPipe) disciplinaId: number,
    @Query("anio", ParseIntPipe) anio: number,
  ) {
    return this.pagosService.getPlanilla(disciplinaId, anio);
  }

  @Get("morosos")
  @Roles("admin", "entrenador")
  getMorosos(
    @Query("disciplinaId", new OptionalParseIntPipe()) disciplinaId?: number,
    @Query("anio", new OptionalParseIntPipe()) anio?: number,
  ) {
    return this.pagosService.getMorosos(disciplinaId, anio);
  }

  @Get("reporte")
  @Roles("admin")
  async descargarReporte(
    @Query("formato") formato: "pdf" | "excel",
    @Res() res: Response,
    @Query("mes") mes?: string,
    @Query("anio") anio?: string
  ) {
    const numeroMes = mes ? (MESES_MAP[mes.toLowerCase()] ?? parseInt(mes)) : undefined;
    const anioNum = anio ? parseInt(anio) : undefined;

    let fechaDesde: Date | undefined;
    let fechaHasta: Date | undefined;
    if (numeroMes !== undefined && !Number.isNaN(numeroMes)) {
      const year = anioNum && !Number.isNaN(anioNum) ? anioNum : new Date().getFullYear();
      fechaDesde = new Date(Date.UTC(year, numeroMes - 1, 1));
      fechaHasta = new Date(Date.UTC(year, numeroMes, 1));
    } else if (anioNum !== undefined && !Number.isNaN(anioNum)) {
      fechaDesde = new Date(Date.UTC(anioNum, 0, 1));
      fechaHasta = new Date(Date.UTC(anioNum + 1, 0, 1));
    }

    const CHUNK = 1000;
    let pagos: any[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await this.pagosService.findAllParaReporte({
        page,
        limit: CHUNK,
        fechaDesde,
        fechaHasta,
      });
      pagos = pagos.concat(result.data);
      totalPages = result.totalPages;
      page++;
    } while (page <= totalPages);

    const datosFormateados = pagos.map((p) => ({
      id: p.id_pago,
      monto: `${p.monto_pagado} Bs.`,
      concepto: p.concepto?.nombre || "Mensualidad",
      fecha: p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString("es-BO") : "—",
      estado: p.estado_factura ? p.estado_factura.toUpperCase() : "ACTIVA",
    }));

    const columnas = [
      { header: "ID Pago", key: "id" },
      { header: "Monto", key: "monto" },
      { header: "Concepto", key: "concepto" },
      { header: "Fecha de Pago", key: "fecha" },
      { header: "Estado", key: "estado" },
    ];

    const titulo = "Reporte de Ingresos - Academias Deportivas UCB";
    let buffer: Buffer;

    if (formato === "excel") {
      buffer = await this.reportesService.generarExcel(titulo, columnas, datosFormateados);
      res.set({
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=reporte_pagos.xlsx",
      });
    } else {
      buffer = await this.reportesService.generarPdfTabla(titulo, columnas, datosFormateados);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=reporte_pagos.pdf",
      });
    }

    res.send(buffer);
  }

  @Get("deportista/:id")
  @Roles("admin", "entrenador")
  getPagosDeportista(@Param("id", ParseIntPipe) id: number) {
    return this.pagosService.getPagosDeportista(id);
  }

  @Get("total-recaudado")
  @Roles("admin", "entrenador")
  getTotalRecaudado(@Query("anio", new OptionalParseIntPipe()) anio?: number) {
    return this.pagosService.getTotalRecaudado(anio);
  }

  @Post()
  @Roles("admin")
  registrarPago(@Body() dto: CreatePagoDto) {
    return this.pagosService.registrarPago(dto);
  }

  @Patch(":id/anular")
  @Roles("admin")
  anularPago(@Param("id", ParseIntPipe) id: number) {
    return this.pagosService.anularPago(id);
  }

  @Post("sync")
  @Roles("admin")
  async ejecutarSync() {
    return this.pagosSyncService.sync();
  }

  @Get("sync/pendientes")
  @Roles("admin")
  async getSyncPendientes() {
    return this.pagosSyncService.getPendientes();
  }

  @Post("sync/:id/asignar")
  @Roles("admin")
  async asignarPago(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AsignarPagoDto,
  ) {
    return this.pagosSyncService.asignarPago(id, dto);
  }
}
