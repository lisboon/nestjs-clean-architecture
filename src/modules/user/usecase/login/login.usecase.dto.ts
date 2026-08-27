import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";

export interface LoginUseCaseInputDto {
  email: string;
  password: string;
}

export interface LoginUseCaseOutputDto {
  accessToken: string;
  user: { id: string; name: string; email: string; role: UserRole };
}

export interface LoginUseCaseInterface extends BaseUseCase<
  LoginUseCaseInputDto,
  LoginUseCaseOutputDto
> {
  execute(data: LoginUseCaseInputDto): Promise<LoginUseCaseOutputDto>;
}
