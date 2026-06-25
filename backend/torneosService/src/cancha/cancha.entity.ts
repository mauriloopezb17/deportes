import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cancha")
export class Cancha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 150, default: "" })
  ubicacion: string;

  @Column({ default: 0 })
  capacidad: number;

  @Column({ length: 80, default: "" })
  tipo_superficie: string;

  @Column({ length: 20, default: "disponible" })
  estado: string;
}
