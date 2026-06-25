import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Equipo } from "../equipo/equipo.entity";
import { DelegadoCarrera } from "../delegado-carrera/delegado-carrera.entity";

@Entity("carrera")
export class Carrera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @OneToMany(() => Equipo, (equipo) => equipo.carrera)
  equipos: Equipo[];

  @OneToMany(() => DelegadoCarrera, (delegado) => delegado.carrera)
  delegados: DelegadoCarrera[];
}
