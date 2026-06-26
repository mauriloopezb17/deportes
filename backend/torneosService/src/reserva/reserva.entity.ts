import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cancha } from "../cancha/cancha.entity";
import { Equipo } from "../equipo/equipo.entity";

@Entity("reserva")
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cancha_id: number;

  @Column({ nullable: true })
  equipo_id: number;

  @Column({ type: "date" })
  fecha: string;

  @Column({ length: 10 })
  hora_inicio: string;

  @Column({ length: 10 })
  hora_fin: string;

  @Column({ length: 20, default: "pendiente" })
  estado: string;

  @Column({ type: "text", nullable: true })
  observaciones: string;

  @ManyToOne(() => Cancha)
  @JoinColumn({ name: "cancha_id" })
  cancha: Cancha;

  @ManyToOne(() => Equipo, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: "equipo_id" })
  equipo: Equipo;
}
