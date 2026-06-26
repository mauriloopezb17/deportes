import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule, // <-- ¡AÑADE ESTO AQUÍ!
    // ... otros módulos como CacheModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
