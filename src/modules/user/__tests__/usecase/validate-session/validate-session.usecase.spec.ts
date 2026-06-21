import ValidateSessionUseCase from "../../../usecase/validate-session/validate-session.usecase";
import { User } from "../../../domain/user.entity";
import { UnauthorizedError } from "@/modules/@shared/domain/errors/unauthorized.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const makeUser = (overrides: Partial<Parameters<typeof User.create>[0]> = {}) =>
  User.create({
    name: "Maria Souza",
    email: "maria@backend.com.br",
    password: "$2b$12$hash",
    role: UserRole.ADMIN,
    ...overrides,
  });

const makeSut = ({ user = makeUser() as User | null } = {}) => {
  const userGateway = {
    findById: jest.fn().mockResolvedValue(user),
  };
  const useCase = new ValidateSessionUseCase(userGateway as any);
  return { useCase, userGateway };
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

describe("ValidateSessionUseCase", () => {
  it("returns userId and the role read from the database", async () => {
    const user = makeUser();
    const { useCase } = makeSut({ user });

    const output = await useCase.execute({
      userId: user.id,
      issuedAt: nowSeconds(),
    });

    expect(output).toEqual({ userId: user.id, role: UserRole.ADMIN });
  });

  it("returns the CURRENT role from DB, not whatever was in the token", async () => {
    const demoted = makeUser({ role: UserRole.VIEWER });
    const { useCase } = makeSut({ user: demoted });

    const output = await useCase.execute({
      userId: demoted.id,
      issuedAt: nowSeconds(),
    });

    expect(output.role).toBe(UserRole.VIEWER);
  });

  it("throws UnauthorizedError when the user no longer exists (deleted)", async () => {
    const { useCase } = makeSut({ user: null });

    await expect(
      useCase.execute({ userId: "gone", issuedAt: nowSeconds() }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws UnauthorizedError when the user is deactivated", async () => {
    const user = makeUser();
    user.deactivate();
    const { useCase } = makeSut({ user });

    await expect(
      useCase.execute({ userId: user.id, issuedAt: nowSeconds() }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects tokens issued before tokenValidAfter (e.g. after password change)", async () => {
    const user = makeUser();
    user.invalidateTokens(); // tokenValidAfter = agora
    const { useCase } = makeSut({ user });

    // Token emitido 60s atrás → anterior à invalidação.
    await expect(
      useCase.execute({ userId: user.id, issuedAt: nowSeconds() - 60 }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("accepts tokens issued after tokenValidAfter", async () => {
    const user = makeUser();
    user.invalidateTokens();
    const { useCase } = makeSut({ user });

    // Token emitido no futuro relativo à invalidação → válido.
    const output = await useCase.execute({
      userId: user.id,
      issuedAt: nowSeconds() + 60,
    });

    expect(output.userId).toBe(user.id);
  });
});
