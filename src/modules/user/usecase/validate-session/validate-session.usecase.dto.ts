import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";

export interface ValidateSessionUseCaseInputDto {
  userId: string;
  issuedAt?: number;
}

export interface ValidateSessionUseCaseOutputDto {
  userId: string;
  role: UserRole;
}

export interface ValidateSessionUseCaseInterface extends BaseUseCase<
  ValidateSessionUseCaseInputDto,
  ValidateSessionUseCaseOutputDto
> {
  execute(
    data: ValidateSessionUseCaseInputDto,
  ): Promise<ValidateSessionUseCaseOutputDto>;
}
