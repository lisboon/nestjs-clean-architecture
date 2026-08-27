import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";
import { UserRole } from "@/modules/@shared/domain/enums";

export class CreateUserBodyDto {
  @Length(2, 255, { message: "Name must be between 2 and 255 characters" })
  name: string;

  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @Length(8, 128, { message: "Password must be between 8 and 128 characters" })
  password: string;

  @IsEnum(UserRole, { message: "Invalid role" })
  role: UserRole;

  @IsUUID(4, { message: "Invalid company id" })
  companyId: string;

  @IsOptional()
  @IsString({ message: "AvatarUrl must be a string" })
  avatarUrl?: string;
}
