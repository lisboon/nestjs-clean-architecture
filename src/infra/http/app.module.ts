import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { CompanyModule } from "./company/company.module";
import { loadApplicationConfig } from "@/infra/config/application.config";

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
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
