import ChangePasswordUseCase from "../../../usecase/change-password/change-password.usecase";
import { User } from "../../../domain/user.entity";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const makeSut = ({ currentPasswordMatches = true } = {}) => {
  const user = User.create({
    name: "Maria Souza",
    email: "maria@backend.com.br",
    password: "$2b$12$oldhash",
    role: UserRole.EDITOR,
  });
  const userGateway = {
    findById: jest.fn().mockResolvedValue(user),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const passwordHashService = {
    compare: jest.fn().mockResolvedValue(currentPasswordMatches),
    hash: jest.fn().mockResolvedValue("$2b$12$newhash"),
  };

  const useCase = new ChangePasswordUseCase(
    userGateway as any,
    passwordHashService as any,
  );

  return { useCase, user, userGateway, passwordHashService };
};

const validInput = (id: string) => ({
  id,
  currentPassword: "OldSecret99",
  newPassword: "NewSecret123",
});

describe("ChangePasswordUseCase", () => {
  it("replaces the password after validating the current one", async () => {
    const { useCase, user, userGateway, passwordHashService } = makeSut();

    const output = await useCase.execute(validInput(user.id));

    expect(passwordHashService.compare).toHaveBeenCalledWith(
      "OldSecret99",
      "$2b$12$oldhash",
    );
    expect(passwordHashService.hash).toHaveBeenCalledWith("NewSecret123");
    expect(user.password).toBe("$2b$12$newhash");
    expect(user.tokenValidAfter).toBeInstanceOf(Date); // revoga tokens antigos
    expect(userGateway.update).toHaveBeenCalledTimes(1);
    expect(output.id).toBe(user.id);
  });

  it("throws NotFoundError when user does not exist", async () => {
    const { useCase, userGateway } = makeSut();
    userGateway.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(validInput("b7e6a1c0-0000-4000-8000-000000000000")),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws EntityValidationError when current password is incorrect", async () => {
    const { useCase, user, userGateway } = makeSut({
      currentPasswordMatches: false,
    });

    await expect(useCase.execute(validInput(user.id))).rejects.toBeInstanceOf(
      EntityValidationError,
    );
    expect(userGateway.update).not.toHaveBeenCalled();
  });
});
