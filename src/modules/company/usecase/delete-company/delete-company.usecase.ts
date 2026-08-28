import { CompanyGateway } from "../../gateway/company.gateway";
import { Company } from "../../domain/company.entity";
import { UserGateway } from "@/modules/user/gateway/user.gateway";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";
import { TransactionManager } from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import {
  DeleteCompanyUseCaseInputDto,
  DeleteCompanyUseCaseInterface,
  DeleteCompanyUseCaseOutputDto,
} from "./delete-company.usecase.dto";

export default class DeleteCompanyUseCase implements DeleteCompanyUseCaseInterface {
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly companyGateway: CompanyGateway,
    private readonly userGateway: UserGateway,
  ) {}

  async execute(
    data: DeleteCompanyUseCaseInputDto,
  ): Promise<DeleteCompanyUseCaseOutputDto> {
    return this.transactionManager.execute(
      async (trx) => {
        const company = await this.companyGateway.findById(data.id, trx);
        if (!company) {
          throw new NotFoundError(data.id, Company);
        }

        const activeUsers = await this.userGateway.countActiveByCompany(
          company.id,
          trx,
        );
        if (activeUsers > 0) {
          throw new ForbiddenError("Cannot delete a company with active users");
        }
        company.delete();
        await this.companyGateway.update(company, trx);
        return { id: company.id, deletedAt: company.deletedAt! };
      },
      { isolationLevel: "Serializable" },
    );
  }
}
