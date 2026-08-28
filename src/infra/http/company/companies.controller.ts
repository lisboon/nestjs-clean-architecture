import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth-guard";
import { RolesGuard } from "../auth/roles-guard";
import { Roles } from "../shared/roles.decorator";
import { UserRole } from "@/modules/@shared/domain/enums";
import { CompanyService } from "./company.service";
import { CreateCompanyBodyDto } from "./dto/create-company.body.dto";
import { UpdateCompanyBodyDto } from "./dto/update-company.body.dto";
import { FindCompaniesQueryDto } from "./dto/find-companies.query.dto";
import { UuidParamDto } from "../shared/dto/uuid-param.dto";
import {
  CompaniesPageResponseDto,
  CompanyResponseDto,
  DeleteCompanyResponseDto,
} from "./dto/company.response.dto";
import {
  HttpErrorResponseDto,
  ValidationErrorResponseDto,
} from "../shared/errors/error.response.dto";

@ApiTags("Companies")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@ApiForbiddenResponse({ type: HttpErrorResponseDto })
@ApiUnprocessableEntityResponse({ type: ValidationErrorResponseDto })
@ApiTooManyRequestsResponse({ type: HttpErrorResponseDto })
@Controller("companies")
@UseGuards(AuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Create company (admin only)" })
  @ApiCreatedResponse({ type: CompanyResponseDto })
  async create(@Body() body: CreateCompanyBodyDto) {
    return this.companyService.create(body);
  }

  @Get()
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "List companies with pagination and filters" })
  @ApiOkResponse({ type: CompaniesPageResponseDto })
  async findAll(@Query() query: FindCompaniesQueryDto) {
    return this.companyService.findAll(query);
  }

  @Get(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Find company by id (admin only)" })
  @ApiOkResponse({ type: CompanyResponseDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  async findById(@Param() params: UuidParamDto) {
    return this.companyService.findById({ id: params.id });
  }

  @Patch(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Update company (admin only)" })
  @ApiOkResponse({ type: CompanyResponseDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  async update(
    @Param() params: UuidParamDto,
    @Body() body: UpdateCompanyBodyDto,
  ) {
    return this.companyService.update({ id: params.id, ...body });
  }

  @Delete(":id")
  @Roles({ role: UserRole.ADMIN })
  @ApiOperation({ summary: "Soft delete company (admin only)" })
  @ApiOkResponse({ type: DeleteCompanyResponseDto })
  @ApiNotFoundResponse({ type: HttpErrorResponseDto })
  async delete(@Param() params: UuidParamDto) {
    return this.companyService.delete({ id: params.id });
  }
}
