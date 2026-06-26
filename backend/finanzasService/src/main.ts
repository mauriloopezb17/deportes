import "dotenv/config";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as swaggerUi from "swagger-ui-express";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.setGlobalPrefix("api");

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ];

  app.enableCors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  const swaggerFilePath = path.join(process.cwd(), "docs", "swagger.yaml");
  if (fs.existsSync(swaggerFilePath)) {
    const swaggerDocument = yaml.load(
      fs.readFileSync(swaggerFilePath, "utf8"),
    ) as object;
    app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customSiteTitle: "MS Finanzas - API Docs",
      }),
    );
    app.getHttpAdapter().get("/api/pagos/swagger.yaml", (req, res) => {
      res.sendFile(swaggerFilePath);
    });
  } else {
    Logger.warn(`[Swagger] No se encontró el archivo en: ${swaggerFilePath}`);
  }

  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`[API] Servidor corriendo en: http://localhost:${port}/api`);
  console.log(
    `[DOCS] Swagger disponible en: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
