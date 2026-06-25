import { Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCarreraDto } from "./dto/create-carrera.dto";
import { UpdateCarreraDto } from "./dto/update-carrera.dto";

@ApiTags("Carreras")
@Injectable()
export class CarreraService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Crear una nueva carrera" })
  async create(createCarreraDto: CreateCarreraDto) {
    const carrera = await this.prisma.carreras.create({
      data: {
        nombre: createCarreraDto.nombre,
        activo: true,
      },
    });
    return this.toLegacyCarrera(carrera);
  }

  @ApiOperation({ summary: "Obtener todas las carreras" })
  async findAll() {
    const carreras = await this.prisma.carreras.findMany({
      where: { activo: true },
      orderBy: { id_carrera: "asc" },
    });
    return carreras.map((carrera) => this.toLegacyCarrera(carrera));
  }

  @ApiOperation({ summary: "Obtener una carrera por ID" })
  async findOne(id: number) {
    const carrera = await this.prisma.carreras.findUnique({
      where: { id_carrera: id },
    });
    return carrera ? this.toLegacyCarrera(carrera) : null;
  }

  @ApiOperation({ summary: "Actualizar una carrera" })
  async update(id: number, updateCarreraDto: UpdateCarreraDto) {
    const carrera = await this.prisma.carreras.update({
      where: { id_carrera: id },
      data: {
        ...(updateCarreraDto.nombre ? { nombre: updateCarreraDto.nombre } : {}),
      },
    });
    return this.toLegacyCarrera(carrera);
  }

  @ApiOperation({ summary: "Eliminar una carrera" })
  async remove(id: number): Promise<void> {
    await this.prisma.carreras.update({
      where: { id_carrera: id },
      data: { activo: false },
    });
  }

  private toLegacyCarrera(carrera: any) {
    return {
      id: carrera.id_carrera,
      nombre: carrera.nombre,
      sigla: carrera.sigla,
      activo: carrera.activo,
    };
  }
}
