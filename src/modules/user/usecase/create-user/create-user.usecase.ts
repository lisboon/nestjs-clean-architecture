import { UserGateway } from "../../gateway/user.gateway";
import { User } from "../../domain/user.entity";
import { PasswordHashService } from "@/modules/@shared/domain/services/password-hash.service";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import {
  CreateUserUseCaseInputDto,
  CreateUserUseCaseInterface,
  CreateUserUseCaseOutputDto,
} from "./create-user.usecase.dto";

export default class CreateUserUseCase implements CreateUserUseCaseInterface {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async execute(
    data: CreateUserUseCaseInputDto,
  ): Promise<CreateUserUseCaseOutputDto> {
    const existingUser = await this.userGateway.findByEmail(data.email);
    if (existingUser) {
      throw new EntityValidationError([
        { field: "email", message: "Email already in use" },
      ]);
    }

    const hashedPassword = await this.passwordHashService.hash(data.password);

    const user = User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      avatarUrl: data.avatarUrl,
    });

    await this.userGateway.create(user);

    return user.toJSON();
  }
}
