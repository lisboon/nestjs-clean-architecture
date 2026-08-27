import {
  IsEnum,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { UserRole } from "@/modules/@shared/domain/enums";
import { SortDirection } from "@/modules/@shared/repository/search-params";

export class FindUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Page must be an integer" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "PerPage must be an integer" })
  @Min(1, { message: "PerPage must be at least 1" })
  perPage?: number;

  @IsOptional()
  @IsString({ message: "Sort must be a string" })
  sort?: string;

  @IsOptional()
  @IsIn(["asc", "desc"], { message: "SortDir must be asc or desc" })
  sortDir?: SortDirection;

  @IsOptional()
  @IsString({ message: "Name must be a string" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Email must be a string" })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Invalid role" })
  role?: UserRole;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "Active must be true or false" })
  active?: boolean;
}
