import { Module } from '@nestjs/common';
import { NoticiasService } from './noticias.service';
import { NoticiasController } from './noticias.controller';
import { OracleStorageModule } from '../oracle-storage/oracle-storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OracleStorageModule, AuthModule],
  controllers: [NoticiasController],
  providers: [NoticiasService],
})
export class NoticiasModule {}
