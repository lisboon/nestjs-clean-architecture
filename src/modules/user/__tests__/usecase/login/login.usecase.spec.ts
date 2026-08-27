import LoginUseCase from "../../../usecase/login/login.usecase";
import { User } from "../../../domain/user.entity";
import { BadLoginError } from "@/modules/@shared/domain/errors/bad-login.error";
import { UserRole } from "@/modules/@shared/domain/enums";
import { Company } from "@/modules/company/domain/company.entity";

const makeUser = (overrides: Partial<Parameters<typeof User.create>[0]> = {}) =>
  User.create({
    name: "Maria Souza",
    email: "maria@backend.com.br",
    password: "$2b$12$hashedpassword",
    role: UserRole.ADMIN,
    companyId: "c0000000-0000-4000-8000-000000000000",
    ...overrides,
  });

const makeCompany = () =>
  Company.create({
    id: "c0000000-0000-4000-8000-000000000000",
    name: "Acme",
    slug: "acme",
  });

const makeSut = ({
  user = makeUser(),
  company = makeCompany() as Company | null,
  passwordMatches = true,
} = {}) => {
  const userGateway = {
    findByEmail: jest.fn().mockResolvedValue(user),
  };
  const companyGateway = {
    findById: jest.fn().mockResolvedValue(company),
  };
  const passwordHashService = {
    compare: jest.fn().mockResolvedValue(passwordMatches),
  };
  const jwtTokenService = {
    sign: jest.fn().mockReturnValue("signed-token"),
  };

  const useCase = new LoginUseCase(
    userGateway as any,
    companyGateway as any,
    passwordHashService as any,
    jwtTokenService as any,
  );

  return {
    useCase,
    user,
    userGateway,
    companyGateway,
    passwordHashService,
    jwtTokenService,
  };
};

describe("LoginUseCase", () => {
  it("returns accessToken and user data on valid credentials", async () => {
    const { useCase, user, jwtTokenService } = makeSut();

    const output = await useCase.execute({
      email: "maria@backend.com.br",
      password: "secret123",
    });

    expect(jwtTokenService.sign).toHaveBeenCalledWith({
      userId: user.id,
      role: UserRole.ADMIN,
    });
    expect(output.accessToken).toBe("signed-token");
    expect(output.user).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: UserRole.ADMIN,
    });
  });

  it("throws BadLoginError when user does not exist", async () => {
    const { useCase, userGateway } = makeSut();
    userGateway.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: "ghost@backend.com.br", password: "x" }),
    ).rejects.toBeInstanceOf(BadLoginError);
  });

  it("throws BadLoginError when user is deactivated", async () => {
    const user = makeUser();
    user.deactivate();
    const { useCase } = makeSut({ user });

    await expect(
      useCase.execute({ email: user.email, password: "secret123" }),
    ).rejects.toBeInstanceOf(BadLoginError);
  });

  it("throws BadLoginError when the company does not exist", async () => {
    const { useCase } = makeSut({ company: null });

    await expect(
      useCase.execute({ email: "maria@backend.com.br", password: "secret123" }),
    ).rejects.toBeInstanceOf(BadLoginError);
  });

  it("throws BadLoginError when the company is deactivated", async () => {
    const company = makeCompany();
    company.deactivate();
    const { useCase } = makeSut({ company });

    await expect(
      useCase.execute({ email: "maria@backend.com.br", password: "secret123" }),
    ).rejects.toBeInstanceOf(BadLoginError);
  });

  it("throws BadLoginError when password does not match", async () => {
    const { useCase } = makeSut({ passwordMatches: false });

    await expect(
      useCase.execute({ email: "maria@backend.com.br", password: "wrong" }),
    ).rejects.toBeInstanceOf(BadLoginError);
  });
});
