import { Module } from '@nestjs/common';
import { DeportistasController } from './deportistas.controller';
import { DeportistasService } from './deportistas.service';

@Module({
  controllers: [DeportistasController],
  providers: [DeportistasService]
})
export class DeportistasModule {}
