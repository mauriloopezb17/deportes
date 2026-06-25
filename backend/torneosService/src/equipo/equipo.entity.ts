import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Carrera } from "../carrera/carrera.entity";
import { Disciplina } from "../disciplina/disciplina.entity";
import { JugadorEquipo } from "../jugador-equipo/jugador-equipo.entity";
import { Fixture } from "../fixture/fixture.entity";

@Entity("equipo")
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre_equipo: string;

  @Column()
  carrera_id: number;

  @Column()
  disciplina_id: number;

  @ManyToOne(() => Carrera, (carrera) => carrera.equipos)
  @JoinColumn({ name: "carrera_id" })
  carrera: Carrera;

  @ManyToOne(() => Disciplina, (disciplina) => disciplina.equipos)
  @JoinColumn({ name: "disciplina_id" })
  disciplina: Disciplina;

  @OneToMany(() => JugadorEquipo, (jugadorEquipo) => jugadorEquipo.equipo)
  jugadores: JugadorEquipo[];
}
