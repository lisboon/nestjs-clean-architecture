import CreateUserUseCase from "../../../usecase/create-user/create-user.usecase";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const COMPANY_ID = "c0000000-0000-4000-8000-000000000000";

const validInput = () => ({
  name: "Carlos Lima",
  email: "carlos@backend.com.br",
  password: "SuperSecret99",
  role: UserRole.EDITOR,
  companyId: COMPANY_ID,
});

const makeSut = ({
  existingUserByEmail = null,
  company = { id: COMPANY_ID, active: true },
} = {}) => {
  const transactionContext = {};
  const transactionManager = {
    execute: jest
      .fn()
      .mockImplementation(async (fn: any) => fn(transactionContext)),
  };
  const userGateway = {
    findByEmail: jest.fn().mockResolvedValue(existingUserByEmail),
    create: jest.fn().mockResolvedValue(undefined),
  };
  const passwordHashService = {
    hash: jest.fn().mockResolvedValue("hashed_password"),
  };
  const companyGateway = {
    findById: jest.fn().mockResolvedValue(company),
  };

  const useCase = new CreateUserUseCase(
    transactionManager as any,
    userGateway as any,
    passwordHashService as any,
    companyGateway as any,
  );

  return {
    useCase,
    transactionContext,
    transactionManager,
    userGateway,
    passwordHashService,
    companyGateway,
  };
};

describe("CreateUserUseCase", () => {
  it("hashes password, persists and returns the user without password", async () => {
    const {
      useCase,
      transactionContext,
      transactionManager,
      userGateway,
      passwordHashService,
      companyGateway,
    } = makeSut();

    const output = await useCase.execute(validInput());

    expect(transactionManager.execute).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" },
    );
    expect(companyGateway.findById).toHaveBeenCalledWith(
      COMPANY_ID,
      transactionContext,
    );
    expect(userGateway.findByEmail).toHaveBeenCalledWith(
      "carlos@backend.com.br",
      transactionContext,
    );
    expect(userGateway.findByEmail).toHaveBeenCalledTimes(2);
    expect(companyGateway.findById).toHaveBeenCalledTimes(2);
    expect(passwordHashService.hash).toHaveBeenCalledWith("SuperSecret99");
    expect(userGateway.create).toHaveBeenCalledWith(
      expect.anything(),
      transactionContext,
    );
    expect(output).toMatchObject({
      name: "Carlos Lima",
      email: "carlos@backend.com.br",
      role: UserRole.EDITOR,
      companyId: COMPANY_ID,
      active: true,
    });
    expect(output).not.toHaveProperty("password");
  });

  it("throws EntityValidationError when email is already taken", async () => {
    const { useCase, transactionManager, userGateway, passwordHashService } =
      makeSut();
    userGateway.findByEmail.mockResolvedValue({ id: "existing-id" });

    await expect(useCase.execute(validInput())).rejects.toBeInstanceOf(
      EntityValidationError,
    );
    expect(passwordHashService.hash).not.toHaveBeenCalled();
    expect(transactionManager.execute).not.toHaveBeenCalled();
    expect(userGateway.create).not.toHaveBeenCalled();
  });

  it("throws EntityValidationError when the company does not exist", async () => {
    const { useCase, transactionManager, userGateway, passwordHashService } =
      makeSut({ company: null as any });

    await expect(useCase.execute(validInput())).rejects.toBeInstanceOf(
      EntityValidationError,
    );
    expect(passwordHashService.hash).not.toHaveBeenCalled();
    expect(transactionManager.execute).not.toHaveBeenCalled();
    expect(userGateway.create).not.toHaveBeenCalled();
  });

  it("throws EntityValidationError when the company is inactive", async () => {
    const { useCase, userGateway } = makeSut({
      company: { id: COMPANY_ID, active: false },
    });

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
