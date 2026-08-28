import "dotenv/config";
import "reflect-metadata";
import { ConsoleLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp, configureCors } from "./app.setup";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { loadApplicationConfig } from "@/infra/config/application.config";
import { join } from "node:path";
import { API_INFO } from "./api-info.response.dto";

async function bootstrap() {
  const config = loadApplicationConfig();
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: config.nodeEnv === "production",
      colors: config.nodeEnv !== "production",
    }),
  });
  app.enableShutdownHooks();

  configureApp(app);

  configureCors(app, config.corsOrigins);

  if (config.nodeEnv !== "production") {
    const { default: metadata } = await import(
      join(__dirname, "../../metadata.js")
    );
    await SwaggerModule.loadPluginMetadata(metadata);
    const swaggerConfig = new DocumentBuilder()
      .setTitle(API_INFO.name)
      .setDescription(API_INFO.description)
      .setVersion(API_INFO.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api-docs", app, document);
  }

  await app.listen(config.port);
}

bootstrap();
