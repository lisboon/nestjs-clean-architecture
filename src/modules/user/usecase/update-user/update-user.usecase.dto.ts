import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";
import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";

export class UpdateUserUseCaseInputDto {
  @IsUUID(4, { message: "Invalid user id" })
  id: string;

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

export interface UpdateUserUseCaseOutputDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UpdateUserUseCaseInterface extends BaseUseCase<
  UpdateUserUseCaseInputDto,
  UpdateUserUseCaseOutputDto
> {
  execute(data: UpdateUserUseCaseInputDto): Promise<UpdateUserUseCaseOutputDto>;
}
