import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard, JwtPayload } from "../auth/auth-guard";
import { RolesGuard } from "../auth/roles-guard";
import { Roles } from "../shared/roles.decorator";
import { UserRole } from "@/modules/@shared/domain/enums";
import { UserService } from "./user.service";
import { UpdateUserBodyDto } from "./dto/update-user.body.dto";
import { ChangePasswordBodyDto } from "./dto/change-password.body.dto";
import { CreateUserBodyDto } from "./dto/create-user.body.dto";
import { FindUsersQueryDto } from "./dto/find-users.query.dto";
import { UuidParamDto } from "../shared/dto/uuid-param.dto";
import {
  ChangePasswordResponseDto,
  DeleteUserResponseDto,
  UserResponseDto,
  UsersPageResponseDto,
} from "./dto/user.response.dto";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Create user (admin only)" })
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@Body() body: CreateUserBodyDto) {
    return this.userService.create(body);
  }

  @Get()
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "List users with pagination and filters" })
  @ApiOkResponse({ type: UsersPageResponseDto })
  async findAll(@Query() query: FindUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @Patch("me/password")
  @Roles({ role: UserRole.USER })
  @ApiOperation({ summary: "Change own password" })
  @ApiOkResponse({ type: ChangePasswordResponseDto })
  async changePassword(
    @Request() req: { user: JwtPayload },
    @Body() body: ChangePasswordBodyDto,
  ) {
    return this.userService.changePassword({
      id: req.user.userId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
  }

  @Get(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Find user by id (admin only)" })
  @ApiOkResponse({ type: UserResponseDto })
  async findById(@Param() params: UuidParamDto) {
    return this.userService.findById({ id: params.id });
  }

  @Patch(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Update user (admin only)" })
  @ApiOkResponse({ type: UserResponseDto })
  async update(@Param() params: UuidParamDto, @Body() body: UpdateUserBodyDto) {
    return this.userService.update({ id: params.id, ...body });
  }

  @Delete(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Soft delete user (admin only)" })
  @ApiOkResponse({ type: DeleteUserResponseDto })
  async delete(@Param() params: UuidParamDto) {
    return this.userService.delete({ id: params.id });
  }
}
