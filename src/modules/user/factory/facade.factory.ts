import prisma from "@/infra/database/prisma.instance";
import { PrismaTransactionManager } from "@/infra/database/prisma-transaction.manager";
import { BcryptPasswordHashService } from "@/infra/services/bcrypt-password-hash.service";
import { JwtTokenServiceImpl } from "@/infra/services/jwt-token.service";
import UserRepository from "../repository/user.repository";
import LoginUseCase from "../usecase/login/login.usecase";
import ValidateSessionUseCase from "../usecase/validate-session/validate-session.usecase";
import FindUserByIdUseCase from "../usecase/find-by-id/find-by-id.usecase";
import FindAllUsersUseCase from "../usecase/find-all/find-all.usecase";
import CreateUserUseCase from "../usecase/create-user/create-user.usecase";
import UpdateUserUseCase from "../usecase/update-user/update-user.usecase";
import ChangePasswordUseCase from "../usecase/change-password/change-password.usecase";
import DeleteUserUseCase from "../usecase/delete-user/delete-user.usecase";
import UserFacade from "../facade/user.facade";

export default class UserFacadeFactory {
  static create(): UserFacade {
    const userRepository = new UserRepository(prisma);
    const transactionManager = new PrismaTransactionManager(prisma);
    const passwordHashService = new BcryptPasswordHashService();
    const jwtTokenService = new JwtTokenServiceImpl();

    return new UserFacade(
      new LoginUseCase(userRepository, passwordHashService, jwtTokenService),
      new ValidateSessionUseCase(userRepository),
      new FindUserByIdUseCase(userRepository),
      new FindAllUsersUseCase(userRepository),
      new CreateUserUseCase(userRepository, passwordHashService),
      new UpdateUserUseCase(transactionManager, userRepository),
      new ChangePasswordUseCase(userRepository, passwordHashService),
      new DeleteUserUseCase(transactionManager, userRepository),
    );
  }
}
