import {
  IsString,
  IsInt,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  ape_paterno: string;

  @IsString()
  @IsOptional()
  ape_materno?: string;

  @IsString()
  @IsNotEmpty()
  fecha_nacimiento: string;

  @IsString()
  @IsNotEmpty()
  celular: string;

  @IsString()
  @IsNotEmpty()
  ci: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty()
  email: string;

  @IsInt()
  @IsNotEmpty()
  id_rol: number;

  @ValidateIf((o) => o.id_rol === 3)
  @IsInt()
  @IsNotEmpty({
    message: 'Para registrar un Delegado, la carrera es obligatoria',
  })
  id_carrera?: number;

  @ValidateIf((o) => o.id_rol === 3)
  @IsInt()
  @IsNotEmpty({
    message: 'Para registrar un Delegado, la gestión es obligatoria',
  })
  gestion?: number;
}
