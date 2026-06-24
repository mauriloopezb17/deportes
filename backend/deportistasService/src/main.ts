import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as swaggerUi from 'swagger-ui-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const swaggerFilePath = path.join(process.cwd(), 'docs', 'swagger.yaml');

  if (fs.existsSync(swaggerFilePath)) {
    const swaggerDocument = yaml.load(
      fs.readFileSync(swaggerFilePath, 'utf8'),
    ) as object;
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'MS3: Deportistas - API Docs',
      }),
    );
  } else {
    console.warn(`[Swagger] No se encontró el archivo en: ${swaggerFilePath}`);
  }

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`[API] Servidor corriendo en: http://localhost:${port}/api`);
  console.log(
    `[DOCS] Swagger disponible en: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
