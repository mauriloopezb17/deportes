import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Persona } from "../persona/persona.entity";
import { Rol } from "../rol/rol.entity";

@Entity("persona_rol")
export class PersonaRol {
  @PrimaryColumn()
  persona_id: number;

  @PrimaryColumn()
  rol_id: number;

  @ManyToOne(() => Persona, (persona) => persona.roles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "persona_id" })
  persona: Persona;

  @ManyToOne(() => Rol, (rol) => rol.personas)
  @JoinColumn({ name: "rol_id" })
  rol: Rol;
}
