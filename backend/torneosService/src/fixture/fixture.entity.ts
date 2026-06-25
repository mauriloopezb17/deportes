import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Equipo } from "../equipo/equipo.entity";

@Entity("fixture")
export class Fixture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  torneo_id: number;

  @Column()
  ronda: number;

  @Column({ nullable: true })
  equipo_local_id: number;

  @Column({ nullable: true })
  equipo_visitante_id: number;

  @Column({ type: "timestamp", nullable: true })
  fecha_hora: Date;

  @Column({ length: 100, nullable: true })
  estadio: string;

  @Column({ nullable: true })
  resultado_local: number;

  @Column({ nullable: true })
  resultado_visitante: number;

  @Column({ nullable: true })
  next_match_id: number;

  @ManyToOne(() => Equipo, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "equipo_local_id" })
  equipoLocal: Equipo;

  @ManyToOne(() => Equipo, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "equipo_visitante_id" })
  equipoVisitante: Equipo;
}
