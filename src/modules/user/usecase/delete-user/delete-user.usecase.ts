import { UserGateway } from "../../gateway/user.gateway";
import { User } from "../../domain/user.entity";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";
import { TransactionManager } from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import {
  DeleteUserUseCaseInputDto,
  DeleteUserUseCaseInterface,
  DeleteUserUseCaseOutputDto,
} from "./delete-user.usecase.dto";

export default class DeleteUserUseCase implements DeleteUserUseCaseInterface {
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly userGateway: UserGateway,
  ) {}

  async execute(
    data: DeleteUserUseCaseInputDto,
  ): Promise<DeleteUserUseCaseOutputDto> {
    const user = await this.userGateway.findById(data.id);
    if (!user) {
      throw new NotFoundError(data.id, User);
    }

    if (user.isAdmin) {
      await this.transactionManager.execute(
        async (trx) => {
          const activeAdmins = await this.userGateway.countActiveAdmins(trx);
          if (activeAdmins <= 1) {
            throw new ForbiddenError("Cannot delete the last active admin");
          }
          user.delete();
          await this.userGateway.update(user, trx);
        },
        { isolationLevel: "Serializable" },
      );
    } else {
      user.delete();
      await this.userGateway.update(user);
    }

    return { id: user.id, deletedAt: user.deletedAt! };
  }
}
