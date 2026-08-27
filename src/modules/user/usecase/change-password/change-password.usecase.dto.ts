import BaseUseCase from "@/modules/@shared/usecase/base.usecase";

export interface ChangePasswordUseCaseInputDto {
  id: string;
  currentPassword: string;
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
