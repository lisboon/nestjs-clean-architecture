import BaseUseCase from "@/modules/@shared/usecase/base.usecase";

export interface UpdateCompanyUseCaseInputDto {
  id: string;
  name?: string;
  slug?: string;
  active?: boolean;
}

export interface UpdateCompanyUseCaseOutputDto {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UpdateCompanyUseCaseInterface extends BaseUseCase<
  UpdateCompanyUseCaseInputDto,
  UpdateCompanyUseCaseOutputDto
> {
  execute(
    data: UpdateCompanyUseCaseInputDto,
  ): Promise<UpdateCompanyUseCaseOutputDto>;
}
