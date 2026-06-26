import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { OracleStorageService } from '../oracle-storage/oracle-storage.service';
import 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly oracleStorage: OracleStorageService) {}

  // Sirve las imagenes temporales del editor (previsualizacion mientras se
  // redacta). Ruta final: GET /api/upload/temp/:filename
  @Get('temp/:filename')
  serveTempImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const safeName = path.basename(filename); // evita path traversal
    const filepath = path.join(process.cwd(), 'uploads/temp', safeName);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Imagen temporal no encontrada.');
    }
    return res.sendFile(filepath);
  }

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
