import { IsString, IsUUID, Length } from "class-validator";
import BaseUseCase from "@/modules/@shared/usecase/base.usecase";

export class ChangePasswordUseCaseInputDto {
  @IsUUID(4, { message: "Invalid user id" })
  id: string;

  @IsString({ message: "Current password must be a string" })
  @Length(1, 128, { message: "Current password is required" })
  currentPassword: string;

  @IsString({ message: "New password must be a string" })
  @Length(8, 128, {
    message: "New password must be between 8 and 128 characters",
  })
  newPassword: string;
}

export interface ChangePasswordUseCaseOutputDto {
  id: string;
  updatedAt: Date;
}

export interface ChangePasswordUseCaseInterface extends BaseUseCase<
  ChangePasswordUseCaseInputDto,
  ChangePasswordUseCaseOutputDto
> {
  execute(
    data: ChangePasswordUseCaseInputDto,
  ): Promise<ChangePasswordUseCaseOutputDto>;
}
