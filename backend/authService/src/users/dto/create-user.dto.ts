export class CreateUserDto {
  nombres: string;
  ape_paterno: string;
  ape_materno?: string;
  fecha_nacimiento: string | Date;
  celular: string;
  ci: string | number;
  complemento?: string;
  email: string;
  password?: string;
  id_rol: number;

  id_carrera?: number;
  gestion?: number;
}
