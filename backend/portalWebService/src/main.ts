import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const yamlPath = path.join(process.cwd(), 'docs', 'swagger.yaml');
  const yamlFile = fs.readFileSync(yamlPath, 'utf8');
  const swaggerDocument = yaml.load(yamlFile) as any;
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'Portal Web - API Docs',
  });

  const port = process.env.PORT || 3002;

  await app.listen(port);
  console.log(`Microservicio corriendo en el puerto: ${port}`);
  console.log(`Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();
