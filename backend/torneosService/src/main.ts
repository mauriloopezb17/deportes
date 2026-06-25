import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import * as fs from "fs";
import * as path from "path";

const yaml = require("js-yaml");

async function bootstrap() {
  const port = Number(process.env.PORT) || 3003;
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Validacion global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix("api");

  const yamlPath = path.join(process.cwd(), "docs", "swagger.yaml");
  const yamlFile = fs.readFileSync(yamlPath, "utf8");
  const swaggerDocument = yaml.load(yamlFile);
  SwaggerModule.setup("api/docs", app, swaggerDocument, {
    customSiteTitle: "Torneos Service - API Docs",
  });

  await app.listen(port);
  console.log(`Aplicacion corriendo en: http://localhost:${port}/api`);
  console.log(`Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();
