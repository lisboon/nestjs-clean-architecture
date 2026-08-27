import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { User } from "../../domain/user.entity";

export interface FindUserByIdUseCaseInputDto {
  id: string;
}

export type FindUserByIdUseCaseOutputDto = User;

export interface FindUserByIdUseCaseInterface extends BaseUseCase<
  FindUserByIdUseCaseInputDto,
  FindUserByIdUseCaseOutputDto
> {
  execute(
    data: FindUserByIdUseCaseInputDto,
  ): Promise<FindUserByIdUseCaseOutputDto>;
}
