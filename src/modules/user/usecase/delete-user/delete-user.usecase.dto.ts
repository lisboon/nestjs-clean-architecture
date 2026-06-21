import { IsUUID } from "class-validator";
import BaseUseCase from "@/modules/@shared/usecase/base.usecase";

export class DeleteUserUseCaseInputDto {
  @IsUUID(4, { message: "Invalid user id" })
  id: string;
}

export interface DeleteUserUseCaseOutputDto {
  id: string;
  deletedAt: Date;
}

export interface DeleteUserUseCaseInterface extends BaseUseCase<
  DeleteUserUseCaseInputDto,
  DeleteUserUseCaseOutputDto
> {
  execute(data: DeleteUserUseCaseInputDto): Promise<DeleteUserUseCaseOutputDto>;
}
