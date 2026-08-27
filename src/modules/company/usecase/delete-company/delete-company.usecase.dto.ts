import BaseUseCase from "@/modules/@shared/usecase/base.usecase";

export interface DeleteCompanyUseCaseInputDto {
  id: string;
}

export interface DeleteCompanyUseCaseOutputDto {
  id: string;
  deletedAt: Date;
}

export interface DeleteCompanyUseCaseInterface extends BaseUseCase<
  DeleteCompanyUseCaseInputDto,
  DeleteCompanyUseCaseOutputDto
> {
  execute(
    data: DeleteCompanyUseCaseInputDto,
  ): Promise<DeleteCompanyUseCaseOutputDto>;
}
