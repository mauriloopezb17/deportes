import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PersonaRol } from "../persona-rol/persona-rol.entity";

@Entity("rol")
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  nombre: string;

  @OneToMany(() => PersonaRol, (personaRol) => personaRol.rol)
  personas: PersonaRol[];
}
