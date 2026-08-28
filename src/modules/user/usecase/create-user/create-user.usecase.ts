import { UserGateway } from "../../gateway/user.gateway";
import { User } from "../../domain/user.entity";
import { CompanyGateway } from "@/modules/company/gateway/company.gateway";
import { PasswordHashService } from "@/modules/@shared/domain/services/password-hash.service";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import {
  TransactionContext,
  TransactionManager,
} from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import {
  CreateUserUseCaseInputDto,
  CreateUserUseCaseInterface,
  CreateUserUseCaseOutputDto,
} from "./create-user.usecase.dto";

export default class CreateUserUseCase implements CreateUserUseCaseInterface {
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly userGateway: UserGateway,
    private readonly passwordHashService: PasswordHashService,
    private readonly companyGateway: CompanyGateway,
  ) {}

  async execute(
    data: CreateUserUseCaseInputDto,
  ): Promise<CreateUserUseCaseOutputDto> {
    await this.validateAvailability(data);

    const hashedPassword = await this.passwordHashService.hash(data.password);

    const user = User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      companyId: data.companyId,
      avatarUrl: data.avatarUrl,
    });

    await this.transactionManager.execute(
      async (trx) => {
        await this.validateAvailability(data, trx);
        await this.userGateway.create(user, trx);
      },
      { isolationLevel: "Serializable" },
    );

    return user.toJSON();
  }

  private async validateAvailability(
    data: CreateUserUseCaseInputDto,
    trx?: TransactionContext,
  ): Promise<void> {
    const existingUser = await this.userGateway.findByEmail(data.email, trx);
    if (existingUser) {
      throw new EntityValidationError([
        { field: "email", message: "Email already in use" },
      ]);
    }

    const company = await this.companyGateway.findById(data.companyId, trx);
    if (!company || !company.active) {
      throw new EntityValidationError([
        { field: "companyId", message: "Company not found or inactive" },
      ]);
    }
  }
}
