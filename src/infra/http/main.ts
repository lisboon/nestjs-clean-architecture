import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { loadApplicationConfig } from "@/infra/config/application.config";

async function bootstrap() {
  const config = loadApplicationConfig();
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  if (config.nodeEnv !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("NestJs API")
      .setDescription("Plataforma digital NestJs — Backend API")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api-docs", app, document);
  }

  await app.listen(config.port);
}

bootstrap();
