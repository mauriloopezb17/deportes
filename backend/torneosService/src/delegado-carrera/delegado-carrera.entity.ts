import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Persona } from "../persona/persona.entity";
import { Carrera } from "../carrera/carrera.entity";

@Entity("delegado_carrera")
export class DelegadoCarrera {
  @PrimaryColumn()
  persona_id: number;

  @PrimaryColumn()
  carrera_id: number;

  @ManyToOne(() => Persona, (persona) => persona.delegadoCarrera)
  @JoinColumn({ name: "persona_id" })
  persona: Persona;

  @ManyToOne(() => Carrera, (carrera) => carrera.delegados)
  @JoinColumn({ name: "carrera_id" })
  carrera: Carrera;
}
