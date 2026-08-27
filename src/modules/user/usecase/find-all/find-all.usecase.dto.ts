import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";
import { SortDirection } from "@/modules/@shared/repository/search-params";

export interface FindAllUsersUseCaseInputDto {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDir?: SortDirection;
  name?: string;
  email?: string;
  role?: UserRole;
  active?: string;
}

export interface FindAllUsersUseCaseOutputDto {
  items: Array<{
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
  }>;
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export interface FindAllUsersUseCaseInterface extends BaseUseCase<
  FindAllUsersUseCaseInputDto,
  FindAllUsersUseCaseOutputDto
> {
  execute(
    data: FindAllUsersUseCaseInputDto,
  ): Promise<FindAllUsersUseCaseOutputDto>;
}
