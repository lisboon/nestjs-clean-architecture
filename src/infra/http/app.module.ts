import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { CompanyModule } from "./company/company.module";
import { loadApplicationConfig } from "@/infra/config/application.config";
import prisma from "@/infra/database/prisma.instance";
import { PRISMA_CLIENT } from "@/infra/database/prisma.provider";
import { PrismaLifecycleService } from "@/infra/database/prisma-lifecycle.service";
import { HealthController } from "./health/health.controller";
import { HealthService } from "./health/health.service";

const config = loadApplicationConfig();

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          ttl: config.throttle.windowMs,
          limit: config.throttle.limit,
        },
      ],
    }),
    AuthModule,
    UserModule,
    CompanyModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    HealthService,
    PrismaLifecycleService,
    { provide: PRISMA_CLIENT, useValue: prisma },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
