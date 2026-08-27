import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";

export interface CreateUserUseCaseInputDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyId: string;
  avatarUrl?: string;
}

export interface CreateUserUseCaseOutputDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
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
