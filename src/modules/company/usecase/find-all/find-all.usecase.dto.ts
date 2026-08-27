import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { SortDirection } from "@/modules/@shared/repository/search-params";

export interface FindAllCompaniesUseCaseInputDto {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDir?: SortDirection;
  name?: string;
  slug?: string;
  active?: boolean;
}

export interface FindAllCompaniesUseCaseOutputDto {
  items: Array<{
    id: string;
    name: string;
    slug: string;
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

export interface FindAllCompaniesUseCaseInterface extends BaseUseCase<
  FindAllCompaniesUseCaseInputDto,
  FindAllCompaniesUseCaseOutputDto
> {
  execute(
    data: FindAllCompaniesUseCaseInputDto,
  ): Promise<FindAllCompaniesUseCaseOutputDto>;
}
