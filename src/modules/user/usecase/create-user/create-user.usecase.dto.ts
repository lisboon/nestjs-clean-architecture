import { IsEmail, IsEnum, IsOptional, IsString, Length } from "class-validator";
import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";

export class CreateUserUseCaseInputDto {
  @Length(2, 255, { message: "Name must be between 2 and 255 characters" })
  name: string;

  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @Length(8, 128, { message: "Password must be between 8 and 128 characters" })
  password: string;

  @IsEnum(UserRole, { message: "Invalid role" })
  role: UserRole;

  @IsOptional()
  @IsString({ message: "AvatarUrl must be a string" })
  avatarUrl?: string;
}

export interface CreateUserUseCaseOutputDto {
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

export interface CreateUserUseCaseInterface extends BaseUseCase<
  CreateUserUseCaseInputDto,
  CreateUserUseCaseOutputDto
> {
  execute(data: CreateUserUseCaseInputDto): Promise<CreateUserUseCaseOutputDto>;
}
