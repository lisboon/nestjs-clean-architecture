import { UserGateway } from "../../gateway/user.gateway";
import { User } from "../../domain/user.entity";
import { PasswordHashService } from "@/modules/@shared/domain/services/password-hash.service";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import {
  ChangePasswordUseCaseInputDto,
  ChangePasswordUseCaseInterface,
  ChangePasswordUseCaseOutputDto,
} from "./change-password.usecase.dto";

export default class ChangePasswordUseCase implements ChangePasswordUseCaseInterface {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async execute(
    data: ChangePasswordUseCaseInputDto,
  ): Promise<ChangePasswordUseCaseOutputDto> {
    const user = await this.userGateway.findById(data.id);
    if (!user) {
      throw new NotFoundError(data.id, User);
    }

    const isCurrentPasswordValid = await this.passwordHashService.compare(
      data.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new EntityValidationError([
        { field: "currentPassword", message: "Current password is incorrect" },
      ]);
    }

    const hashedPassword = await this.passwordHashService.hash(
      data.newPassword,
    );
    user.changePassword(hashedPassword);

    await this.userGateway.update(user);

    return { id: user.id, updatedAt: user.updatedAt };
  }
}
