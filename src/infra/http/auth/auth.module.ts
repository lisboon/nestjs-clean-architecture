import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "./auth-guard";
import { RolesGuard } from "./roles-guard";
import UserFacade from "@/modules/user/facade/user.facade";
import UserFacadeFactory from "@/modules/user/factory/facade.factory";
import { loadApplicationConfig } from "@/infra/config/application.config";

const config = loadApplicationConfig();

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: config.jwt.secret,
      signOptions: {
        algorithm: "HS256",
        expiresIn: config.jwt.expiresIn,
      },
    }),
  ],
  providers: [
    AuthGuard,
    RolesGuard,
    {
      provide: UserFacade,
      useFactory: () => UserFacadeFactory.create(),
    },
  ],
  exports: [AuthGuard, RolesGuard, UserFacade],
})
export class AuthModule {}
