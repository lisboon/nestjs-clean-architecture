import UpdateUserUseCase from "../../../usecase/update-user/update-user.usecase";
import { User } from "../../../domain/user.entity";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const makeUser = (overrides: Partial<Parameters<typeof User.create>[0]> = {}) =>
  User.create({
    name: "Maria Souza",
    email: "maria@backend.com.br",
    password: "$2b$12$hash",
    role: UserRole.EDITOR,
    companyId: "c0000000-0000-4000-8000-000000000000",
    ...overrides,
  });

const makeSut = ({ user = makeUser(), activeAdmins = 2 } = {}) => {
  const transactionContext = {};
  const transactionManager = {
    execute: jest
      .fn()
      .mockImplementation(async (fn: any) => fn(transactionContext)),
  };
  const userGateway = {
    findById: jest.fn().mockResolvedValue(user),
    findByEmail: jest.fn().mockResolvedValue(null),
    countActiveAdmins: jest.fn().mockResolvedValue(activeAdmins),
    update: jest.fn().mockResolvedValue(undefined),
  };

  const useCase = new UpdateUserUseCase(
    transactionManager as any,
    userGateway as any,
  );

  return {
    useCase,
    user,
    transactionContext,
    transactionManager,
    userGateway,
  };
};

describe("UpdateUserUseCase", () => {
  it("updates basic fields and persists", async () => {
    const { useCase, user, userGateway } = makeSut();

    const output = await useCase.execute({
      id: user.id,
      name: "Maria Oliveira",
    });

    expect(userGateway.update).toHaveBeenCalledTimes(1);
    expect(output.name).toBe("Maria Oliveira");
  });

  it("throws NotFoundError when user does not exist", async () => {
    const { useCase, userGateway } = makeSut();
    userGateway.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: "b7e6a1c0-0000-4000-8000-000000000000" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws EntityValidationError when new email belongs to another user", async () => {
    const { useCase, user, userGateway } = makeSut();
    userGateway.findByEmail.mockResolvedValue({ id: "another-id" });

    await expect(
      useCase.execute({ id: user.id, email: "taken@backend.com.br" }),
    ).rejects.toBeInstanceOf(EntityValidationError);
  });

  it("changes role inside a serializable transaction when demoting an admin", async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    const { useCase, transactionContext, transactionManager, userGateway } =
      makeSut({
        user: admin,
      });

    const output = await useCase.execute({
      id: admin.id,
      role: UserRole.EDITOR,
    });

    expect(transactionManager.execute).toHaveBeenCalledWith(
      expect.any(Function),
      {
        isolationLevel: "Serializable",
      },
    );
    expect(userGateway.countActiveAdmins).toHaveBeenCalledWith(
      transactionContext,
    );
    expect(userGateway.findById).toHaveBeenCalledWith(
      admin.id,
      transactionContext,
    );
    expect(userGateway.update).toHaveBeenCalledWith(admin, transactionContext);
    expect(output.role).toBe(UserRole.EDITOR);
  });

  it("uses one transaction context for every protected update operation", async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    const { useCase, transactionContext, userGateway } = makeSut({
      user: admin,
    });

    await useCase.execute({
      id: admin.id,
      email: "new-email@backend.com.br",
      role: UserRole.EDITOR,
    });

    expect(userGateway.findById).toHaveBeenCalledWith(
      admin.id,
      transactionContext,
    );
    expect(userGateway.findByEmail).toHaveBeenCalledWith(
      "new-email@backend.com.br",
      transactionContext,
    );
    expect(userGateway.countActiveAdmins).toHaveBeenCalledWith(
      transactionContext,
    );
    expect(userGateway.update).toHaveBeenCalledWith(admin, transactionContext);
  });

  it("throws ForbiddenError when demoting the last active admin", async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    const { useCase, userGateway } = makeSut({ user: admin, activeAdmins: 1 });

    await expect(
      useCase.execute({ id: admin.id, role: UserRole.VIEWER }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(userGateway.update).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when deactivating the last active admin", async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    const { useCase } = makeSut({ user: admin, activeAdmins: 1 });

    await expect(
      useCase.execute({ id: admin.id, active: false }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("changes the role of an inactive admin transactionally without counting active admins", async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    admin.deactivate();
    const { useCase, transactionContext, transactionManager, userGateway } =
      makeSut({
        user: admin,
        activeAdmins: 1,
      });

    const output = await useCase.execute({
      id: admin.id,
      role: UserRole.VIEWER,
    });

    expect(transactionManager.execute).toHaveBeenCalledTimes(1);
    expect(userGateway.countActiveAdmins).not.toHaveBeenCalled();
    expect(userGateway.update).toHaveBeenCalledWith(admin, transactionContext);
    expect(output.role).toBe(UserRole.VIEWER);
  });

  it("opens a transaction when the requested change could remove admin privileges", async () => {
    const { useCase, user, transactionManager } = makeSut();

    await useCase.execute({ id: user.id, active: false });

    expect(transactionManager.execute).toHaveBeenCalledTimes(1);
  });

  it("never changes companyId (it is immutable after creation)", async () => {
    const { useCase, user } = makeSut();
    const originalCompanyId = user.companyId;

    const output = await useCase.execute({
      id: user.id,
      name: "Maria Oliveira",
    });

    expect(output.companyId).toBe(originalCompanyId);
    expect(user.companyId).toBe(originalCompanyId);
  });
});
