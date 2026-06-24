import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEmail,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class DeportistaDatosDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  ape_paterno: string;

  @IsString()
  @IsNotEmpty()
  ape_materno: string;

  @IsString()
  @IsNotEmpty()
  fecha_nacimiento: string;

  @IsString()
  @IsNotEmpty()
  celular: string;

  @IsInt()
  @IsNotEmpty()
  ci: number;

  @IsString()
  @IsOptional()
  complemento?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  talla_ropa?: string;

  @IsString()
  @IsOptional()
  colegio_instituto?: string;

  @IsString()
  @IsOptional()
  curso?: string;
}

class InscripcionDatosDto {
  @IsInt()
  @IsNotEmpty()
  id_disciplina: number;

  @IsInt()
  @IsNotEmpty()
  id_categoria: number;
}

class TutorDatosDto {
  @IsString()
  @IsOptional()
  nombres?: string;

  @IsString()
  @IsOptional()
  ape_paterno?: string;

  @IsString()
  @IsOptional()
  ape_materno?: string;

  @IsString()
  @IsOptional()
  fecha_nacimiento?: string;

  @IsInt()
  @IsOptional()
  ci?: number;

  @IsString()
  @IsOptional()
  complemento?: string;

  @IsString()
  @IsOptional()
  celular?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

class FichaMedicaDatosDto {
  @IsString()
  @IsNotEmpty() // Si manda ficha, el tipo de sangre es obligatorio según tu BD
  tipo_sangre: string;

  @IsString()
  @IsOptional()
  seguro_medico?: string;

  @IsString()
  @IsOptional()
  enfermedades_padecimientos?: string;

  @IsString()
  @IsNotEmpty()
  contacto_emergencia_nombre: string;

  @IsString()
  @IsNotEmpty()
  contacto_emergencia_telefono: string;
}

class ExperienciaDatosDto {
  @IsString()
  @IsNotEmpty()
  tipo_participacion: string;

  @IsInt()
  @IsNotEmpty()
  gestion: number;

  @IsString()
  @IsNotEmpty()
  club_sede: string;

  @IsString()
  @IsOptional()
  categoria_jugada?: string;
}

export class InscribirDeportistaDto {
  @ValidateNested()
  @Type(() => DeportistaDatosDto)
  @IsNotEmpty()
  deportista: DeportistaDatosDto;

  @ValidateNested()
  @Type(() => InscripcionDatosDto)
  @IsNotEmpty()
  inscripcion: InscripcionDatosDto;

  @ValidateNested()
  @Type(() => TutorDatosDto)
  @IsOptional()
  tutor?: TutorDatosDto;

  @ValidateNested()
  @Type(() => FichaMedicaDatosDto)
  @IsOptional()
  ficha_medica?: FichaMedicaDatosDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienciaDatosDto)
  @IsOptional()
  experiencias?: ExperienciaDatosDto[];
}
