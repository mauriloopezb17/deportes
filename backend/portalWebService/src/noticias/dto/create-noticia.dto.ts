import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NoticiaImageDto {
  @IsString()
  @IsNotEmpty()
  url_storage: string;

  @IsBoolean()
  es_portada: boolean;
}

export class CreateNoticiaDto {
  @IsInt()
  @IsOptional()
  id_usuario_autor?: number;

  @IsInt()
  @IsNotEmpty()
  id_categoria_noticia: number;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsNotEmpty()
  contenido: any;

  @IsString()
  @IsOptional()
  resumen?: string;

  @IsBoolean()
  @IsOptional()
  publicado?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NoticiaImageDto)
  imagenes?: NoticiaImageDto[];
}
