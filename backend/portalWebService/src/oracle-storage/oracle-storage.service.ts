import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import 'multer';

@Injectable()
export class OracleStorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private cdnPublicUrl: string;
  private namespace: string;

  constructor() {
    const region = process.env.OCI_REGION || 'sa-santiago-1';
    this.namespace = process.env.OCI_NAMESPACE || 'axyfij7zeu3h';
    this.bucketName = process.env.OCI_BUCKET_NAME || 'bucket-imagenes';
    this.cdnPublicUrl =
      process.env.CDN_PUBLIC_URL || 'https://imagenes.62344037.xyz';

    const endpoint = `https://${this.namespace}.compat.objectstorage.${region}.oraclecloud.com`;

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: process.env.OCI_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.OCI_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }

  async subirTempAOCI(urlTemp: string): Promise<string> {
    const tempIdx = urlTemp.lastIndexOf('/temp/');
    if (tempIdx === -1) {
      throw new Error(`URL temporal inválida: ${urlTemp}`);
    }
    const filename = urlTemp.substring(tempIdx + 6);

    // Buscamos tanto en la raíz de portalWebService como en la raíz del backend/deportes
    const pathsToTry = [
      path.join(process.cwd(), 'uploads/temp', filename),
      path.join(process.cwd(), '../uploads/temp', filename),
      path.join(process.cwd(), '../../uploads/temp', filename),
    ];

    let activePath = '';
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        activePath = p;
        break;
      }
    }

    if (!activePath) {
      throw new Error(
        `Archivo temporal no encontrado. Rutas intentadas:\n${pathsToTry.join('\n')}`,
      );
    }

    const buffer = fs.readFileSync(activePath);
    const ociFilename = `cms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: ociFilename,
        Body: buffer,
        ContentType: 'image/webp',
      }),
    );

    try {
      fs.unlinkSync(activePath);
    } catch (err) {
      console.warn(
        `No se pudo eliminar el archivo temporal ${activePath}:`,
        err,
      );
    }

    return `${this.cdnPublicUrl}/n/${this.namespace}/b/${this.bucketName}/o/${ociFilename}`;
  }

  // ── Método nuevo: Subir archivo directo a OCI (Imagen de portada general) ──
  async subirArchivoDirecto(file: Express.Multer.File): Promise<string> {
    let fileBuffer = file.buffer;
    let contentType = file.mimetype;
    let extension = 'bin';

    if (contentType.startsWith('image/')) {
      fileBuffer = await sharp(file.buffer)
        .resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      contentType = 'image/webp';
      extension = 'webp';
    } else if (contentType.startsWith('video/')) {
      extension = contentType === 'video/webm' ? 'webm' : 'mp4';
    }

    const uniqueFilename = `media-${Date.now()}.${extension}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFilename,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    );

    return `${this.cdnPublicUrl}/n/${this.namespace}/b/${this.bucketName}/o/${uniqueFilename}`;
  }

  // ── Método nuevo: Guardar en carpeta local temporal (Imágenes del editor mientras se redacta) ──
  async guardarArchivoTemporal(file: Express.Multer.File): Promise<string> {
    const tempDir = path.join(process.cwd(), 'uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `temp-${Date.now()}.webp`;
    const filepath = path.join(tempDir, filename);

    await sharp(file.buffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    return `/temp/${filename}`;
  }
}
