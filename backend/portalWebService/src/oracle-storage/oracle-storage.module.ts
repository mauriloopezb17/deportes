import { Module } from '@nestjs/common';
import { OracleStorageService } from './oracle-storage.service';

@Module({
  providers: [OracleStorageService],
  exports: [OracleStorageService],
})
export class OracleStorageModule {}
