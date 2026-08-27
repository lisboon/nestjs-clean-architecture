import BaseUseCase from "@/modules/@shared/usecase/base.usecase";

export interface CreateCompanyUseCaseInputDto {
  name: string;
  slug: string;
}

export interface CreateCompanyUseCaseOutputDto {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCompanyUseCaseInterface extends BaseUseCase<
  CreateCompanyUseCaseInputDto,
  CreateCompanyUseCaseOutputDto
> {
  execute(
    data: CreateCompanyUseCaseInputDto,
  ): Promise<CreateCompanyUseCaseOutputDto>;
}
