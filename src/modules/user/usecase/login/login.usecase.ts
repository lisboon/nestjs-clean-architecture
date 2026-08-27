import { UserGateway } from "../../gateway/user.gateway";
import { CompanyGateway } from "@/modules/company/gateway/company.gateway";
import { PasswordHashService } from "@/modules/@shared/domain/services/password-hash.service";
import { JwtTokenService } from "@/modules/@shared/domain/services/jwt-token.service";
import { BadLoginError } from "@/modules/@shared/domain/errors/bad-login.error";
import {
  LoginUseCaseInputDto,
  LoginUseCaseInterface,
  LoginUseCaseOutputDto,
} from "./login.usecase.dto";

export default class LoginUseCase implements LoginUseCaseInterface {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly companyGateway: CompanyGateway,
    private readonly passwordHashService: PasswordHashService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(data: LoginUseCaseInputDto): Promise<LoginUseCaseOutputDto> {
    const user = await this.userGateway.findByEmail(data.email);
    if (!user || !user.active) {
      throw new BadLoginError();
    }

    const isPasswordValid = await this.passwordHashService.compare(
      data.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadLoginError();
    }

    const company = await this.companyGateway.findById(user.companyId);
    if (!company || !company.active) {
      throw new BadLoginError();
    }

    const accessToken = this.jwtTokenService.sign({
      userId: user.id,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
