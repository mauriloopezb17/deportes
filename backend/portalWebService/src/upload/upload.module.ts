import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { OracleStorageModule } from '../oracle-storage/oracle-storage.module';

@Module({
  imports: [OracleStorageModule], // Importa tu módulo existente de OCI
  controllers: [UploadController],
})
export class UploadModule {}
