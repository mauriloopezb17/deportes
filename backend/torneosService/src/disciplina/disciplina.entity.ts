import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Equipo } from "../equipo/equipo.entity";
import { Torneo } from "../torneo/torneo.entity";

@Entity("disciplina")
export class Disciplina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @OneToMany(() => Equipo, (equipo) => equipo.disciplina)
  equipos: Equipo[];

  @OneToMany(() => Torneo, (torneo) => torneo.disciplina)
  torneos: Torneo[];
}
