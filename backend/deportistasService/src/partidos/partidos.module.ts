import { Module } from '@nestjs/common';
import { PartidosController } from './partidos.controller';
import { PartidosService } from './partidos.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PartidosController],
  providers: [PartidosService, PrismaService],
})
export class PartidosModule {}
