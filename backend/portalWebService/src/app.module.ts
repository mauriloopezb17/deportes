import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NoticiasModule } from './noticias/noticias.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, NoticiasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
