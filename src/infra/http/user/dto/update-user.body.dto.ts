import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { UserRole } from "@/modules/@shared/domain/enums";

export class UpdateUserBodyDto {
  @IsOptional()
  @Length(2, 255, { message: "Name must be between 2 and 255 characters" })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: "Invalid email address" })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Invalid role" })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: "AvatarUrl must be a string" })
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean({ message: "Active must be a boolean" })
  active?: boolean;
}
