import { Injectable } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

const DEFAULT_CATEGORIES = [
  "Mayor - cualquier edad",
  "Sub 25",
  "Juvenil - 19 años para abajo",
  "Menor - 17 años para abajo",
  "Infantil - menores de 15 años",
  "Mini Voleibol - menores de 13 años",
  "Sub 10",
];

@ApiTags("Categorias")
@Injectable()
export class CategoriaService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: "Listar categorias deportivas" })
  async findAll() {
    await this.ensureDefaultCategories();

    const categorias = await this.prisma.categorias.findMany({
      orderBy: { id_categoria: "asc" },
    });

    return categorias.map((categoria) => ({
      id: categoria.id_categoria,
      nombre: categoria.nombre_categoria,
    }));
  }

  private async ensureDefaultCategories() {
    for (const nombre of DEFAULT_CATEGORIES) {
      const existing = await this.prisma.categorias.findFirst({
        where: { nombre_categoria: { equals: nombre, mode: "insensitive" } },
      });

      if (!existing) {
        await this.prisma.categorias.create({
          data: { nombre_categoria: nombre },
        });
      }
    }
  }
}
