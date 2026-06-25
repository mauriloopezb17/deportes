import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Torneo } from "../torneo/torneo.entity";
import { Equipo } from "../equipo/equipo.entity";

@Entity("torneo_equipo")
export class TorneoEquipo {
  @PrimaryColumn()
  torneo_id: number;

  @PrimaryColumn()
  equipo_id: number;

  @ManyToOne(() => Torneo, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "torneo_id" })
  torneo: Torneo;

  @ManyToOne(() => Equipo, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "equipo_id" })
  equipo: Equipo;
}
