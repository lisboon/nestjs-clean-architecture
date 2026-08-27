import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";

export interface UpdateUserUseCaseInputDto {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
  avatarUrl?: string;
  active?: boolean;
}

export interface UpdateUserUseCaseOutputDto {
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

export interface UpdateUserUseCaseInterface extends BaseUseCase<
  UpdateUserUseCaseInputDto,
  UpdateUserUseCaseOutputDto
> {
  execute(data: UpdateUserUseCaseInputDto): Promise<UpdateUserUseCaseOutputDto>;
}
