import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";

// Módulos
import { CarreraModule } from "./carrera/carrera.module";
import { CategoriaModule } from "./categoria/categoria.module";
import { DisciplinaModule } from "./disciplina/disciplina.module";
import { PersonaModule } from "./persona/persona.module";
import { RolModule } from "./rol/rol.module";
import { PersonaRolModule } from "./persona-rol/persona-rol.module";
import { DelegadoCarreraModule } from "./delegado-carrera/delegado-carrera.module";
import { EquipoModule } from "./equipo/equipo.module";
import { JugadorEquipoModule } from "./jugador-equipo/jugador-equipo.module";
import { TorneoModule } from "./torneo/torneo.module";
import { FixtureModule } from "./fixture/fixture.module";
import { TorneoEquipoModule } from "./torneo-equipo/torneo-equipo.module";
import { CanchaModule } from "./cancha/cancha.module";
import { ReservaModule } from "./reserva/reserva.module";
import { EntrenadorPanelModule } from "./entrenador-panel/entrenador-panel.module";
import { PartidosModule } from "./partidos/partidos.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CarreraModule,
    CategoriaModule,
    DisciplinaModule,
    PersonaModule,
    RolModule,
    PersonaRolModule,
    DelegadoCarreraModule,
    EquipoModule,
    JugadorEquipoModule,
    TorneoModule,
    FixtureModule,
    TorneoEquipoModule,
    CanchaModule,
    ReservaModule,
    EntrenadorPanelModule,
    PartidosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
