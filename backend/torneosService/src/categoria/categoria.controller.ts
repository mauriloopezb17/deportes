import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriaService } from "./categoria.service";

@ApiTags("Categorias")
@Controller("categoria")
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  @ApiOperation({ summary: "Listar categorias deportivas" })
  findAll() {
    return this.categoriaService.findAll();
  }
}
