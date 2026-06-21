import CreateUserUseCase from "../../../usecase/create-user/create-user.usecase";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const validInput = () => ({
  name: "Carlos Lima",
  email: "carlos@backend.com.br",
  password: "SuperSecret99",
  role: UserRole.EDITOR,
});

const makeSut = ({ existingUserByEmail = null } = {}) => {
  const userGateway = {
    findByEmail: jest.fn().mockResolvedValue(existingUserByEmail),
    create: jest.fn().mockResolvedValue(undefined),
  };
  const passwordHashService = {
    hash: jest.fn().mockResolvedValue("hashed_password"),
  };

  const useCase = new CreateUserUseCase(
    userGateway as any,
    passwordHashService as any,
  );

  return { useCase, userGateway, passwordHashService };
};

describe("CreateUserUseCase", () => {
  it("hashes password, persists and returns the user without password", async () => {
    const { useCase, userGateway, passwordHashService } = makeSut();

    const output = await useCase.execute(validInput());

    expect(passwordHashService.hash).toHaveBeenCalledWith("SuperSecret99");
    expect(userGateway.create).toHaveBeenCalledTimes(1);
    expect(output).toMatchObject({
      name: "Carlos Lima",
      email: "carlos@backend.com.br",
      role: UserRole.EDITOR,
      active: true,
    });
    expect(output).not.toHaveProperty("password");
  });

  it("throws EntityValidationError when email is already taken", async () => {
    const { useCase, userGateway } = makeSut();
    userGateway.findByEmail.mockResolvedValue({ id: "existing-id" });

    await expect(useCase.execute(validInput())).rejects.toBeInstanceOf(
      EntityValidationError,
    );
    expect(userGateway.create).not.toHaveBeenCalled();
  });

  it("propagates entity validation when domain rules fail", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ ...validInput(), name: "x" }),
    ).rejects.toBeInstanceOf(EntityValidationError);
  });
});
