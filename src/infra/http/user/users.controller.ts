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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard, JwtPayload } from "../auth/auth-guard";
import { RolesGuard } from "../auth/roles-guard";
import { Roles } from "../shared/roles.decorator";
import { UserRole } from "@/modules/@shared/domain/enums";
import { UserService } from "./user.service";
import { CreateUserUseCaseInputDto } from "@/modules/user/usecase/create-user/create-user.usecase.dto";
import { FindAllUsersUseCaseInputDto } from "@/modules/user/usecase/find-all/find-all.usecase.dto";
import { UpdateUserBodyDto } from "./dto/update-user.body.dto";
import { ChangePasswordBodyDto } from "./dto/change-password.body.dto";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Create user (admin only)" })
  async create(@Body() body: CreateUserUseCaseInputDto) {
    return this.userService.create(body);
  }

  @Get()
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "List users with pagination and filters" })
  async findAll(@Query() query: FindAllUsersUseCaseInputDto) {
    return this.userService.findAll(query);
  }

  @Patch("me/password")
  @Roles({ role: UserRole.USER })
  @ApiOperation({ summary: "Change own password" })
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
  async findById(@Param("id") id: string) {
    return this.userService.findById({ id });
  }

  @Patch(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Update user (admin only)" })
  async update(@Param("id") id: string, @Body() body: UpdateUserBodyDto) {
    return this.userService.update({ id, ...body });
  }

  @Delete(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Soft delete user (admin only)" })
  async delete(@Param("id") id: string) {
    return this.userService.delete({ id });
  }
}
