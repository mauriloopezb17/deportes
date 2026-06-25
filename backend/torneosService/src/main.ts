import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './docs/swagger.config';

async function bootstrap() {
  const port = Number(process.env.PORT) || 3004;
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Validacion global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.setGlobalPrefix('api');
  setupSwagger(app);

  await app.listen(port);
  console.log(`Aplicacion corriendo en: http://localhost:${port}/api`);
  console.log(`Swagger disponible en: http://localhost:${port}/api/docs`);
  console.log(`Swagger JSON disponible en: http://localhost:${port}/api/docs-json`);
}
bootstrap();
