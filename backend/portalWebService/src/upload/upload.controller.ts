import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OracleStorageService } from '../oracle-storage/oracle-storage.service';
import 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly oracleStorage: OracleStorageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'video/mp4',
          'video/webm',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Formato no soportado. Solo imágenes (JPG, PNG, WEBP) o videos (MP4, WEBM)',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('No se proporcionó ningún archivo.');

    const finalPublicUrl = await this.oracleStorage.subirArchivoDirecto(file);
    return { url: finalPublicUrl };
  }

  @Post('temp')
  @UseInterceptors(
    FileInterceptor('imagen', {
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Solo se permiten imágenes para archivos temporales',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadTempImage(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('No se proporcionó ninguna imagen.');

    const tempUrl = await this.oracleStorage.guardarArchivoTemporal(file);
    return { success: 1, url: tempUrl };
  }
}
