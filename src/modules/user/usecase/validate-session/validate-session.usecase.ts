import { UserGateway } from "../../gateway/user.gateway";
import { CompanyGateway } from "@/modules/company/gateway/company.gateway";
import { UnauthorizedError } from "@/modules/@shared/domain/errors/unauthorized.error";
import {
  ValidateSessionUseCaseInputDto,
  ValidateSessionUseCaseInterface,
  ValidateSessionUseCaseOutputDto,
} from "./validate-session.usecase.dto";

export default class ValidateSessionUseCase implements ValidateSessionUseCaseInterface {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly companyGateway: CompanyGateway,
  ) {}

  async execute(
    data: ValidateSessionUseCaseInputDto,
  ): Promise<ValidateSessionUseCaseOutputDto> {
    const user = await this.userGateway.findById(data.userId);

    if (!user || !user.active) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const company = await this.companyGateway.findById(user.companyId);
    if (!company || !company.active) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    if (user.tokenValidAfter && data.issuedAt === undefined) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    if (user.tokenValidAfter && data.issuedAt !== undefined) {
      const issuedAtMs = data.issuedAt * 1000;
      if (issuedAtMs < user.tokenValidAfter.getTime()) {
        throw new UnauthorizedError("Invalid or expired token");
      }
    }

    return { userId: user.id, role: user.role };
  }
}
