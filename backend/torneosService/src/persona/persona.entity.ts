import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PersonaRol } from "../persona-rol/persona-rol.entity";
import { DelegadoCarrera } from "../delegado-carrera/delegado-carrera.entity";
import { JugadorEquipo } from "../jugador-equipo/jugador-equipo.entity";

@Entity("persona")
export class Persona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nombre: string;

  @Column({ length: 50 })
  apellido: string;

  @Column({ length: 20, unique: true })
  carnet: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20 })
  celular: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @OneToMany(() => PersonaRol, (personaRol) => personaRol.persona)
  roles: PersonaRol[];

  @OneToMany(() => DelegadoCarrera, (delegado) => delegado.persona)
  delegadoCarrera: DelegadoCarrera[];

  @OneToMany(() => JugadorEquipo, (jugadorEquipo) => jugadorEquipo.jugador)
  jugadorEquipos: JugadorEquipo[];
}
