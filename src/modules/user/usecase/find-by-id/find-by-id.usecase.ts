import { UserGateway } from "../../gateway/user.gateway";
import { User } from "../../domain/user.entity";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import {
  FindUserByIdUseCaseInputDto,
  FindUserByIdUseCaseInterface,
  FindUserByIdUseCaseOutputDto,
} from "./find-by-id.usecase.dto";

export default class FindUserByIdUseCase implements FindUserByIdUseCaseInterface {
  constructor(private readonly userGateway: UserGateway) {}

  async execute(
    data: FindUserByIdUseCaseInputDto,
  ): Promise<FindUserByIdUseCaseOutputDto> {
    const user = await this.userGateway.findById(data.id);
    if (!user) {
      throw new NotFoundError(data.id, User);
    }
    return user;
  }
}
