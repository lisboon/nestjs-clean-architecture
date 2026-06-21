import { UserGateway } from "../../gateway/user.gateway";
import { User } from "../../domain/user.entity";
import { UserRole } from "@/modules/@shared/domain/enums";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { normalizeEmail } from "@/modules/@shared/domain/utils/email";
import { TransactionManager } from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import {
  UpdateUserUseCaseInputDto,
  UpdateUserUseCaseInterface,
  UpdateUserUseCaseOutputDto,
} from "./update-user.usecase.dto";

export default class UpdateUserUseCase implements UpdateUserUseCaseInterface {
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly userGateway: UserGateway,
  ) {}

  async execute(
    data: UpdateUserUseCaseInputDto,
  ): Promise<UpdateUserUseCaseOutputDto> {
    const user = await this.userGateway.findById(data.id);
    if (!user) {
      throw new NotFoundError(data.id, User);
    }

    if (data.email !== undefined && normalizeEmail(data.email) !== user.email) {
      const existingUser = await this.userGateway.findByEmail(data.email);
      if (existingUser && existingUser.id !== user.id) {
        throw new EntityValidationError([
          { field: "email", message: "Email already in use" },
        ]);
      }
    }

    const losesAdminPrivileges =
      user.isAdmin &&
      ((data.role !== undefined && data.role !== UserRole.ADMIN) ||
        data.active === false);

    if (losesAdminPrivileges) {
      await this.transactionManager.execute(
        async (trx) => {
          const activeAdmins = await this.userGateway.countActiveAdmins(trx);
          if (activeAdmins <= 1) {
            throw new ForbiddenError(
              "Cannot remove privileges from the last active admin",
            );
          }
          this.applyChanges(user, data);
          await this.userGateway.update(user, trx);
        },
        { isolationLevel: "Serializable" },
      );
    } else {
      this.applyChanges(user, data);
      await this.userGateway.update(user);
    }

    return user.toJSON();
  }

  private applyChanges(user: User, data: UpdateUserUseCaseInputDto): void {
    user.updateUser({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    });

    if (data.role !== undefined) {
      user.changeRole(data.role);
    }

    if (data.active === true) {
      user.activate();
    }
    if (data.active === false) {
      user.deactivate();
    }
  }
}
