import { INestApplication, ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { EntityValidationErrorFilter } from "./shared/errors/entity-validation.filter";
import { NotFoundErrorFilter } from "./shared/errors/not-found.filter";
import { UnauthorizedErrorFilter } from "./shared/errors/unauthorized.filter";
import { ForbiddenErrorFilter } from "./shared/errors/forbidden.filter";
import { BadLoginErrorFilter } from "./shared/errors/bad-login.filter";
import { TokenExpiredErrorFilter } from "./shared/errors/token-expired.filter";
import exceptionFactory from "./shared/errors/exception-factory";

export function configureApp(app: INestApplication): void {
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
}
