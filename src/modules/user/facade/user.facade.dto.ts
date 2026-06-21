import {
  LoginUseCaseInputDto,
  LoginUseCaseOutputDto,
} from "../usecase/login/login.usecase.dto";
import { FindUserByIdUseCaseInputDto } from "../usecase/find-by-id/find-by-id.usecase.dto";
import {
  FindAllUsersUseCaseInputDto,
  FindAllUsersUseCaseOutputDto,
} from "../usecase/find-all/find-all.usecase.dto";
import {
  CreateUserUseCaseInputDto,
  CreateUserUseCaseOutputDto,
} from "../usecase/create-user/create-user.usecase.dto";
import {
  UpdateUserUseCaseInputDto,
  UpdateUserUseCaseOutputDto,
} from "../usecase/update-user/update-user.usecase.dto";
import {
  ChangePasswordUseCaseInputDto,
  ChangePasswordUseCaseOutputDto,
} from "../usecase/change-password/change-password.usecase.dto";
import {
  DeleteUserUseCaseInputDto,
  DeleteUserUseCaseOutputDto,
} from "../usecase/delete-user/delete-user.usecase.dto";
import {
  ValidateSessionUseCaseInputDto,
  ValidateSessionUseCaseOutputDto,
} from "../usecase/validate-session/validate-session.usecase.dto";
import { UserRole } from "@/modules/@shared/domain/enums";

export type LoginFacadeInputDto = LoginUseCaseInputDto;
export type LoginFacadeOutputDto = LoginUseCaseOutputDto;

export type FindUserByIdFacadeInputDto = FindUserByIdUseCaseInputDto;
export interface FindUserByIdFacadeOutputDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type FindAllUsersFacadeInputDto = FindAllUsersUseCaseInputDto;
export type FindAllUsersFacadeOutputDto = FindAllUsersUseCaseOutputDto;

export type CreateUserFacadeInputDto = CreateUserUseCaseInputDto;
export type CreateUserFacadeOutputDto = CreateUserUseCaseOutputDto;

export type UpdateUserFacadeInputDto = UpdateUserUseCaseInputDto;
export type UpdateUserFacadeOutputDto = UpdateUserUseCaseOutputDto;

export type ChangePasswordFacadeInputDto = ChangePasswordUseCaseInputDto;
export type ChangePasswordFacadeOutputDto = ChangePasswordUseCaseOutputDto;

export type DeleteUserFacadeInputDto = DeleteUserUseCaseInputDto;
export type DeleteUserFacadeOutputDto = DeleteUserUseCaseOutputDto;

export type ValidateSessionFacadeInputDto = ValidateSessionUseCaseInputDto;
export type ValidateSessionFacadeOutputDto = ValidateSessionUseCaseOutputDto;

export interface UserFacadeInterface {
  login(data: LoginFacadeInputDto): Promise<LoginFacadeOutputDto>;
  validateSession(
    data: ValidateSessionFacadeInputDto,
  ): Promise<ValidateSessionFacadeOutputDto>;
  findById(
    data: FindUserByIdFacadeInputDto,
  ): Promise<FindUserByIdFacadeOutputDto>;
  findAll(
    data: FindAllUsersFacadeInputDto,
  ): Promise<FindAllUsersFacadeOutputDto>;
  create(data: CreateUserFacadeInputDto): Promise<CreateUserFacadeOutputDto>;
  update(data: UpdateUserFacadeInputDto): Promise<UpdateUserFacadeOutputDto>;
  changePassword(
    data: ChangePasswordFacadeInputDto,
  ): Promise<ChangePasswordFacadeOutputDto>;
  delete(data: DeleteUserFacadeInputDto): Promise<DeleteUserFacadeOutputDto>;
}
