import { LoginUseCaseInterface } from "../usecase/login/login.usecase.dto";
import { ValidateSessionUseCaseInterface } from "../usecase/validate-session/validate-session.usecase.dto";
import { FindUserByIdUseCaseInterface } from "../usecase/find-by-id/find-by-id.usecase.dto";
import { FindAllUsersUseCaseInterface } from "../usecase/find-all/find-all.usecase.dto";
import { CreateUserUseCaseInterface } from "../usecase/create-user/create-user.usecase.dto";
import { UpdateUserUseCaseInterface } from "../usecase/update-user/update-user.usecase.dto";
import { ChangePasswordUseCaseInterface } from "../usecase/change-password/change-password.usecase.dto";
import { DeleteUserUseCaseInterface } from "../usecase/delete-user/delete-user.usecase.dto";
import {
  UserFacadeInterface,
  LoginFacadeInputDto,
  LoginFacadeOutputDto,
  FindUserByIdFacadeInputDto,
  FindUserByIdFacadeOutputDto,
  FindAllUsersFacadeInputDto,
  FindAllUsersFacadeOutputDto,
  CreateUserFacadeInputDto,
  CreateUserFacadeOutputDto,
  UpdateUserFacadeInputDto,
  UpdateUserFacadeOutputDto,
  ChangePasswordFacadeInputDto,
  ChangePasswordFacadeOutputDto,
  DeleteUserFacadeInputDto,
  DeleteUserFacadeOutputDto,
  ValidateSessionFacadeInputDto,
  ValidateSessionFacadeOutputDto,
} from "./user.facade.dto";

export default class UserFacade implements UserFacadeInterface {
  constructor(
    private readonly loginUseCase: LoginUseCaseInterface,
    private readonly validateSessionUseCase: ValidateSessionUseCaseInterface,
    private readonly findUserByIdUseCase: FindUserByIdUseCaseInterface,
    private readonly findAllUsersUseCase: FindAllUsersUseCaseInterface,
    private readonly createUserUseCase: CreateUserUseCaseInterface,
    private readonly updateUserUseCase: UpdateUserUseCaseInterface,
    private readonly changePasswordUseCase: ChangePasswordUseCaseInterface,
    private readonly deleteUserUseCase: DeleteUserUseCaseInterface,
  ) {}

  async login(data: LoginFacadeInputDto): Promise<LoginFacadeOutputDto> {
    return this.loginUseCase.execute(data);
  }

  async validateSession(
    data: ValidateSessionFacadeInputDto,
  ): Promise<ValidateSessionFacadeOutputDto> {
    return this.validateSessionUseCase.execute(data);
  }

  async findById(
    data: FindUserByIdFacadeInputDto,
  ): Promise<FindUserByIdFacadeOutputDto> {
    const user = await this.findUserByIdUseCase.execute(data);
    return user.toJSON();
  }

  async findAll(
    data: FindAllUsersFacadeInputDto,
  ): Promise<FindAllUsersFacadeOutputDto> {
    return this.findAllUsersUseCase.execute(data);
  }

  async create(
    data: CreateUserFacadeInputDto,
  ): Promise<CreateUserFacadeOutputDto> {
    return this.createUserUseCase.execute(data);
  }

  async update(
    data: UpdateUserFacadeInputDto,
  ): Promise<UpdateUserFacadeOutputDto> {
    return this.updateUserUseCase.execute(data);
  }

  async changePassword(
    data: ChangePasswordFacadeInputDto,
  ): Promise<ChangePasswordFacadeOutputDto> {
    return this.changePasswordUseCase.execute(data);
  }

  async delete(
    data: DeleteUserFacadeInputDto,
  ): Promise<DeleteUserFacadeOutputDto> {
    return this.deleteUserUseCase.execute(data);
  }
}
