import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthGuard, JwtPayload } from "../auth/auth-guard";
import { RolesGuard } from "../auth/roles-guard";
import { Roles } from "../shared/roles.decorator";
import { UserRole } from "@/modules/@shared/domain/enums";
import { UserService } from "./user.service";
import { LoginUseCaseInputDto } from "@/modules/user/usecase/login/login.usecase.dto";

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } } as const;

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post("login")
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: "Login with email and password" })
  async login(@Body() body: LoginUseCaseInputDto) {
    return this.userService.login(body);
  }

  @Get("me")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles({ role: UserRole.USER })
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user" })
  async me(@Request() req: { user: JwtPayload }) {
    return this.userService.findById({ id: req.user.userId });
  }
}
