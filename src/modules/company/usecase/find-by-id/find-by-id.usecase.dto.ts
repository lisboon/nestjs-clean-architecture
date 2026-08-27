import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { Company } from "../../domain/company.entity";

export interface FindCompanyByIdUseCaseInputDto {
  id: string;
}

export type FindCompanyByIdUseCaseOutputDto = Company;

export interface FindCompanyByIdUseCaseInterface extends BaseUseCase<
  FindCompanyByIdUseCaseInputDto,
  FindCompanyByIdUseCaseOutputDto
> {
  execute(
    data: FindCompanyByIdUseCaseInputDto,
  ): Promise<FindCompanyByIdUseCaseOutputDto>;
}
