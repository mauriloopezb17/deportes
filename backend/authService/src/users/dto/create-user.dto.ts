import {
  IsDateString,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
} from 'class-validator'; // <-- Añade IsDateString aquí

export class CreateUserDto {
  nombres: string;
  ape_paterno: string;
  ape_materno?: string;
  // ESTO ES CLAVE: Valida que sea un string de fecha válido antes de llegar al servicio
  @IsDateString(
    {},
    {
      message:
        'fecha_nacimiento debe ser una fecha válida en formato YYYY-MM-DD',
    },
  )
  fecha_nacimiento: string;
  celular: string;
  ci: string | number;
  complemento?: string;
  email: string;
  password?: string;
  id_rol: number;

  id_carrera?: number;
  gestion?: number;
}
