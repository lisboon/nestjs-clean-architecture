import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthController } from "./auth.controller";
import { UsersController } from "./users.controller";
import { UserService } from "./user.service";

@Module({
  imports: [AuthModule],
  controllers: [AuthController, UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
