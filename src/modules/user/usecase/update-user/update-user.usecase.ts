import { UserGateway } from "../../gateway/user.gateway";
import { User } from "../../domain/user.entity";
import { UserRole } from "@/modules/@shared/domain/enums";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { normalizeEmail } from "@/modules/@shared/domain/utils/email";
import {
  TransactionContext,
  TransactionManager,
} from "@/modules/@shared/domain/transaction/transaction-manager.interface";
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
    const mayRemoveAdminPrivileges =
      (data.role !== undefined && data.role !== UserRole.ADMIN) ||
      data.active === false;

    const user = mayRemoveAdminPrivileges
      ? await this.transactionManager.execute((trx) => this.update(data, trx), {
          isolationLevel: "Serializable",
        })
      : await this.update(data);

    return user.toJSON();
  }

  private async update(
    data: UpdateUserUseCaseInputDto,
    trx?: TransactionContext,
  ): Promise<User> {
    const user = await this.userGateway.findById(data.id, trx);
    if (!user) {
      throw new NotFoundError(data.id, User);
    }

    if (data.email !== undefined && normalizeEmail(data.email) !== user.email) {
      const existingUser = await this.userGateway.findByEmail(data.email, trx);
      if (existingUser && existingUser.id !== user.id) {
        throw new EntityValidationError([
          { field: "email", message: "Email already in use" },
        ]);
      }
    }

    const losesAdminPrivileges =
      user.isAdmin &&
      user.active &&
      ((data.role !== undefined && data.role !== UserRole.ADMIN) ||
        data.active === false);

    if (losesAdminPrivileges) {
      const activeAdmins = await this.userGateway.countActiveAdmins(trx);
      if (activeAdmins <= 1) {
        throw new ForbiddenError(
          "Cannot remove privileges from the last active admin",
        );
      }
    }

    this.applyChanges(user, data);
    await this.userGateway.update(user, trx);
    return user;
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
