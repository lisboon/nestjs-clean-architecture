import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { StringValue } from "ms";
import { AuthGuard } from "./auth-guard";
import { RolesGuard } from "./roles-guard";
import UserFacade from "@/modules/user/facade/user.facade";
import UserFacadeFactory from "@/modules/user/factory/facade.factory";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: (() => {
        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET environment variable is not set.");
        }
        return process.env.JWT_SECRET;
      })(),
      signOptions: {
        algorithm: "HS256",
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as StringValue,
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
