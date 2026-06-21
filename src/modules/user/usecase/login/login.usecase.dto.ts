import { IsEmail, IsString, Length } from "class-validator";
import BaseUseCase from "@/modules/@shared/usecase/base.usecase";
import { UserRole } from "@/modules/@shared/domain/enums";

export class LoginUseCaseInputDto {
  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @Length(1, 128, { message: "Password must be between 1 and 128 characters" })
  password: string;
}

export interface LoginUseCaseOutputDto {
  accessToken: string;
  user: { id: string; name: string; email: string; role: UserRole };
}

export interface LoginUseCaseInterface extends BaseUseCase<
  LoginUseCaseInputDto,
  LoginUseCaseOutputDto
> {
  execute(data: LoginUseCaseInputDto): Promise<LoginUseCaseOutputDto>;
}
