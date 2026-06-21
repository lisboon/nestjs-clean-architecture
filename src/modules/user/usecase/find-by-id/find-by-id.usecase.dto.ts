import { IsUUID } from "class-validator";
import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { User } from "../../domain/user.entity";

export class FindUserByIdUseCaseInputDto {
  @IsUUID(4, { message: "Invalid user id" })
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
