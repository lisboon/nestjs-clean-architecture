import { Inject, Injectable } from "@nestjs/common";
import UserFacade from "@/modules/user/facade/user.facade";
import {
  LoginFacadeInputDto,
  FindUserByIdFacadeInputDto,
  FindAllUsersFacadeInputDto,
  CreateUserFacadeInputDto,
  UpdateUserFacadeInputDto,
  ChangePasswordFacadeInputDto,
  DeleteUserFacadeInputDto,
} from "@/modules/user/facade/user.facade.dto";

@Injectable()
export class UserService {
  @Inject(UserFacade)
  private readonly userFacade: UserFacade;

  async login(input: LoginFacadeInputDto) {
    return this.userFacade.login(input);
  }

  async findById(input: FindUserByIdFacadeInputDto) {
    return this.userFacade.findById(input);
  }

  async findAll(input: FindAllUsersFacadeInputDto) {
    return this.userFacade.findAll(input);
  }

  async create(input: CreateUserFacadeInputDto) {
    return this.userFacade.create(input);
  }

  async update(input: UpdateUserFacadeInputDto) {
    return this.userFacade.update(input);
  }

  async changePassword(input: ChangePasswordFacadeInputDto) {
    return this.userFacade.changePassword(input);
  }

  async delete(input: DeleteUserFacadeInputDto) {
    return this.userFacade.delete(input);
  }
}
