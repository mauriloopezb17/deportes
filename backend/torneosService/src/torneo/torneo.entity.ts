import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Disciplina } from "../disciplina/disciplina.entity";

@Entity("torneo")
export class Torneo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 20 })
  tipo: string;

  @Column({ length: 20, default: "planeado" })
  estado: string;

  @Column()
  disciplina_id: number;

  @Column({ type: "date", nullable: true })
  fecha_inicio: Date;

  @Column({ type: "date", nullable: true })
  fecha_fin: Date;

  @Column({ type: "text", nullable: true })
  imagen_url: string;

  @ManyToOne(() => Disciplina, (disciplina) => disciplina.torneos)
  @JoinColumn({ name: "disciplina_id" })
  disciplina: Disciplina;
}
