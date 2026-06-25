import { Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDisciplinaDto } from "./dto/create-disciplina.dto";
import { UpdateDisciplinaDto } from "./dto/update-disciplina.dto";

@ApiTags("Disciplinas")
@Injectable()
export class DisciplinaService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Crear una nueva disciplina" })
  async create(createDisciplinaDto: CreateDisciplinaDto) {
    const disciplina = await this.prisma.disciplinas.create({
      data: {
        nombre_disciplina: createDisciplinaDto.nombre,
        activo: true,
      },
    });
    return this.toLegacyDisciplina(disciplina);
  }

  @ApiOperation({ summary: "Obtener todas las disciplinas" })
  async findAll() {
    const disciplinas = await this.prisma.disciplinas.findMany({
      where: { activo: true },
      orderBy: { id_disciplina: "asc" },
    });
    return disciplinas.map((disciplina) => this.toLegacyDisciplina(disciplina));
  }

  @ApiOperation({ summary: "Obtener una disciplina por ID" })
  async findOne(id: number) {
    const disciplina = await this.prisma.disciplinas.findUnique({
      where: { id_disciplina: id },
    });
    return disciplina ? this.toLegacyDisciplina(disciplina) : null;
  }

  @ApiOperation({ summary: "Actualizar una disciplina" })
  async update(id: number, updateDisciplinaDto: UpdateDisciplinaDto) {
    const disciplina = await this.prisma.disciplinas.update({
      where: { id_disciplina: id },
      data: {
        ...(updateDisciplinaDto.nombre
          ? { nombre_disciplina: updateDisciplinaDto.nombre }
          : {}),
      },
    });
    return this.toLegacyDisciplina(disciplina);
  }

  @ApiOperation({ summary: "Eliminar una disciplina" })
  async remove(id: number): Promise<void> {
    await this.prisma.disciplinas.update({
      where: { id_disciplina: id },
      data: { activo: false },
    });
  }

  private toLegacyDisciplina(disciplina: any) {
    return {
      id: disciplina.id_disciplina,
      nombre: disciplina.nombre_disciplina,
      activo: disciplina.activo,
    };
  }
}
