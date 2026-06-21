import UserFacade from "../../facade/user.facade";
import { User } from "../../domain/user.entity";
import { UserRole } from "@/modules/@shared/domain/enums";

const makeSut = () => {
  const user = User.create({
    name: "Maria Souza",
    email: "maria@backend.com.br",
    password: "$2b$12$hash",
    role: UserRole.ADMIN,
  });

  const loginOutput = {
    accessToken: "token-abc",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: UserRole.ADMIN,
    },
  };

  const loginUseCase = { execute: jest.fn().mockResolvedValue(loginOutput) };
  const validateSessionUseCase = {
    execute: jest
      .fn()
      .mockResolvedValue({ userId: user.id, role: UserRole.ADMIN }),
  };
  const findUserByIdUseCase = { execute: jest.fn().mockResolvedValue(user) };
  const findAllUsersUseCase = { execute: jest.fn().mockResolvedValue({}) };
  const createUserUseCase = {
    execute: jest.fn().mockResolvedValue(user.toJSON()),
  };
  const updateUserUseCase = {
    execute: jest.fn().mockResolvedValue(user.toJSON()),
  };
  const changePasswordUseCase = {
    execute: jest.fn().mockResolvedValue({ id: user.id }),
  };
  const deleteUserUseCase = {
    execute: jest.fn().mockResolvedValue({ id: user.id }),
  };

  const facade = new UserFacade(
    loginUseCase as any,
    validateSessionUseCase as any,
    findUserByIdUseCase as any,
    findAllUsersUseCase as any,
    createUserUseCase as any,
    updateUserUseCase as any,
    changePasswordUseCase as any,
    deleteUserUseCase as any,
  );

  return {
    facade,
    user,
    loginOutput,
    loginUseCase,
    validateSessionUseCase,
    findUserByIdUseCase,
    findAllUsersUseCase,
    createUserUseCase,
    updateUserUseCase,
    changePasswordUseCase,
    deleteUserUseCase,
  };
};

describe("UserFacade", () => {
  it("login delegates to use case and returns its output", async () => {
    const { facade, loginOutput, loginUseCase } = makeSut();
    const input = { email: "maria@backend.com.br", password: "secret123" };

    const output = await facade.login(input);

    expect(loginUseCase.execute).toHaveBeenCalledWith(input);
    expect(output).toEqual(loginOutput);
  });

  it("findById delegates to use case and serializes the entity via toJSON", async () => {
    const { facade, user, findUserByIdUseCase } = makeSut();

    const output = await facade.findById({ id: user.id });

    expect(findUserByIdUseCase.execute).toHaveBeenCalledWith({ id: user.id });
    expect(output).toEqual(user.toJSON());
    expect(output).not.toBe(user);
  });

  it.each([
    [
      "validateSession",
      "validateSessionUseCase",
      { userId: "id-1", issuedAt: 1 },
    ],
    ["findAll", "findAllUsersUseCase", { page: 1 }],
    ["create", "createUserUseCase", { name: "x" }],
    ["update", "updateUserUseCase", { id: "id-1" }],
    ["changePassword", "changePasswordUseCase", { id: "id-1" }],
    ["delete", "deleteUserUseCase", { id: "id-1" }],
  ] as const)(
    "%s delegates to its use case",
    async (method, useCaseKey, input) => {
      const sut = makeSut();

      await (sut.facade[method] as (i: unknown) => Promise<unknown>)(input);

      expect(sut[useCaseKey].execute).toHaveBeenCalledWith(input);
    },
  );
});
