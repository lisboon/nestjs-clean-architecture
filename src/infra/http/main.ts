import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { EntityValidationErrorFilter } from "./shared/errors/entity-validation.filter";
import { NotFoundErrorFilter } from "./shared/errors/not-found.filter";
import { UnauthorizedErrorFilter } from "./shared/errors/unauthorized.filter";
import { ForbiddenErrorFilter } from "./shared/errors/forbidden.filter";
import { BadLoginErrorFilter } from "./shared/errors/bad-login.filter";
import { TokenExpiredErrorFilter } from "./shared/errors/token-expired.filter";
import exceptionFactory from "./shared/errors/exception-factory";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory,
      errorHttpStatusCode: 422,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(
    new EntityValidationErrorFilter(),
    new NotFoundErrorFilter(),
    new UnauthorizedErrorFilter(),
    new ForbiddenErrorFilter(),
    new BadLoginErrorFilter(),
    new TokenExpiredErrorFilter(),
  );

  const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Swagger não é exposto em produção (evita publicar o mapa da API).
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("NestJs API")
      .setDescription("Plataforma digital NestJs — Backend API")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-docs", app, document);
  }

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
