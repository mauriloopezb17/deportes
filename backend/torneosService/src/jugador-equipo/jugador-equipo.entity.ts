import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Persona } from "../persona/persona.entity";
import { Equipo } from "../equipo/equipo.entity";

@Entity("jugador_equipo")
export class JugadorEquipo {
  @PrimaryColumn()
  jugador_id: number;

  @PrimaryColumn()
  equipo_id: number;

  @ManyToOne(() => Persona, (persona) => persona.jugadorEquipos)
  @JoinColumn({ name: "jugador_id" })
  jugador: Persona;

  @ManyToOne(() => Equipo, (equipo) => equipo.jugadores)
  @JoinColumn({ name: "equipo_id" })
  equipo: Equipo;
}
