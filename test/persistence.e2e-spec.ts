import { randomUUID } from "crypto";
import prisma from "../src/infra/database/prisma.instance";
import { PrismaTransactionManager } from "../src/infra/database/prisma-transaction.manager";
import { ForbiddenError } from "../src/modules/@shared/domain/errors/forbidden.error";
import { EntityValidationError } from "../src/modules/@shared/domain/errors/validation.error";
import { UserRole } from "../src/modules/@shared/domain/enums";
import { Company } from "../src/modules/company/domain/company.entity";
import CompanyRepository from "../src/modules/company/repository/company.repository";
import DeleteCompanyUseCase from "../src/modules/company/usecase/delete-company/delete-company.usecase";
import { User } from "../src/modules/user/domain/user.entity";
import UserRepository from "../src/modules/user/repository/user.repository";
import CreateUserUseCase from "../src/modules/user/usecase/create-user/create-user.usecase";
import DeleteUserUseCase from "../src/modules/user/usecase/delete-user/delete-user.usecase";
import { PasswordHashService } from "../src/modules/@shared/domain/services/password-hash.service";

describe("Persistence (e2e)", () => {
  const companyIds: string[] = [];
  const companyRepository = new CompanyRepository(prisma);
  const userRepository = new UserRepository(prisma);
  const transactionManager = new PrismaTransactionManager(prisma, {
    retryDelayMs: 0,
  });
  const passwordHashService: PasswordHashService = {
    hash: async () => "$2b$12$integration-hash",
    compare: async () => true,
  };

  const makeCompany = (): Company => {
    const id = randomUUID();
    companyIds.push(id);
    return Company.create({
      id,
      name: `Integration ${id}`,
      slug: `integration-${id}`,
    });
  };

  const makeUser = (
    companyId: string,
    role: UserRole,
    email?: string,
  ): User => {
    const id = randomUUID();
    return User.create({
      id,
      name: `Integration ${id}`,
      email: email ?? `${id}@integration.test`,
      password: "$2b$12$integration-hash",
      role,
      companyId,
    });
  };

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { companyId: { in: companyIds } } });
    await prisma.company.deleteMany({ where: { id: { in: companyIds } } });
    companyIds.length = 0;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("persists and maps company and user entities through the repositories", async () => {
    const company = makeCompany();
    const user = makeUser(company.id, UserRole.EDITOR);

    await companyRepository.create(company);
    await userRepository.create(user);

    const persistedCompany = await companyRepository.findById(company.id);
    const persistedUser = await userRepository.findById(user.id);

    expect(persistedCompany).toBeInstanceOf(Company);
    expect(persistedCompany).toMatchObject({
      id: company.id,
      name: company.name,
      slug: company.slug,
      active: true,
      deletedAt: undefined,
    });
    expect(persistedUser).toBeInstanceOf(User);
    expect(persistedUser).toMatchObject({
      id: user.id,
      email: user.email,
      role: UserRole.EDITOR,
      companyId: company.id,
      avatarUrl: undefined,
      tokenValidAfter: undefined,
      active: true,
      deletedAt: undefined,
    });
  });

  it("rolls back repository writes when the transaction callback fails", async () => {
    const company = makeCompany();
    const failure = new Error("Rollback integration transaction");

    await expect(
      transactionManager.execute(async (trx) => {
        await companyRepository.create(company, trx);
        throw failure;
      }),
    ).rejects.toBe(failure);

    await expect(
      prisma.company.findUnique({ where: { id: company.id } }),
    ).resolves.toBeNull();
  });

  it("retries a real PostgreSQL serialization conflict", async () => {
    const company = makeCompany();
    const attempts = [0, 0];
    let synchronizedTransactions = 0;
    let releaseBarrier: () => void = () => undefined;
    const barrier = new Promise<void>((resolve) => {
      releaseBarrier = resolve;
    });

    await companyRepository.create(company);

    const updateCompany = (index: number, name: string) =>
      transactionManager.execute(
        async (trx) => {
          attempts[index] += 1;
          const persistedCompany = await companyRepository.findById(
            company.id,
            trx,
          );

          expect(persistedCompany).not.toBeNull();

          if (attempts[index] === 1) {
            synchronizedTransactions += 1;
            if (synchronizedTransactions === 2) releaseBarrier();
            await barrier;
          }

          persistedCompany!.updateCompany({ name });
          await companyRepository.update(persistedCompany!, trx);
        },
        { isolationLevel: "Serializable" },
      );

    await expect(
      Promise.all([
        updateCompany(0, "First concurrent update"),
        updateCompany(1, "Second concurrent update"),
      ]),
    ).resolves.toEqual([undefined, undefined]);

    const persistedCompany = await companyRepository.findById(company.id);

    expect(attempts).toContain(2);
    expect(attempts[0] + attempts[1]).toBe(3);
    expect(["First concurrent update", "Second concurrent update"]).toContain(
      persistedCompany?.name,
    );
  });

  it("translates a concurrent duplicate slug into a domain validation error", async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();
    const slug = `concurrent-${randomUUID()}`;
    companyIds.push(firstId, secondId);
    const firstCompany = Company.create({
      id: firstId,
      name: "First duplicate slug",
      slug,
    });
    const secondCompany = Company.create({
      id: secondId,
      name: "Second duplicate slug",
      slug,
    });

    const results = await Promise.allSettled([
      companyRepository.create(firstCompany),
      companyRepository.create(secondCompany),
    ]);
    const rejected = results.find((result) => result.status === "rejected");

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(rejected).toMatchObject({
      reason: expect.any(EntityValidationError),
    });
    expect(rejected).toMatchObject({
      reason: expect.objectContaining({
        name: "EntityValidationError",
        error: [{ field: "slug", message: "Slug already in use" }],
      }),
    });
    expect(await prisma.company.count({ where: { slug } })).toBe(1);
  });

  it("translates a concurrent duplicate email into a domain validation error", async () => {
    const company = makeCompany();
    const email = `${randomUUID()}@integration.test`;
    const firstUser = makeUser(company.id, UserRole.USER, email);
    const secondUser = makeUser(company.id, UserRole.USER, email);

    await companyRepository.create(company);

    const results = await Promise.allSettled([
      userRepository.create(firstUser),
      userRepository.create(secondUser),
    ]);
    const rejected = results.find((result) => result.status === "rejected");

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(rejected).toMatchObject({
      reason: expect.any(EntityValidationError),
    });
    expect(rejected).toMatchObject({
      reason: expect.objectContaining({
        name: "EntityValidationError",
        error: [{ field: "email", message: "Email already in use" }],
      }),
    });
    expect(await prisma.user.count({ where: { email } })).toBe(1);
  });

  it("keeps user creation and company deletion consistent under concurrency", async () => {
    const company = makeCompany();
    const createUser = new CreateUserUseCase(
      transactionManager,
      userRepository,
      passwordHashService,
      companyRepository,
    );
    const deleteCompany = new DeleteCompanyUseCase(
      transactionManager,
      companyRepository,
      userRepository,
    );

    await companyRepository.create(company);

    const results = await Promise.allSettled([
      createUser.execute({
        name: "Concurrent User",
        email: `${randomUUID()}@integration.test`,
        password: "Sup3rSecret!",
        role: UserRole.USER,
        companyId: company.id,
      }),
      deleteCompany.execute({ id: company.id }),
    ]);

    const persistedCompany = await prisma.company.findUnique({
      where: { id: company.id },
    });
    const persistedUsers = await prisma.user.count({
      where: { companyId: company.id, deletedAt: null },
    });
    const rejected = results.find((result) => result.status === "rejected");

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);

    if (persistedCompany?.deletedAt) {
      expect(persistedUsers).toBe(0);
      expect(rejected).toMatchObject({
        reason: expect.any(EntityValidationError),
      });
    } else {
      expect(persistedCompany?.active).toBe(true);
      expect(persistedUsers).toBe(1);
      expect(rejected).toMatchObject({ reason: expect.any(ForbiddenError) });
    }
  });

  it("preserves one active admin under concurrent deletion attempts", async () => {
    const company = makeCompany();
    const firstAdmin = makeUser(company.id, UserRole.ADMIN);
    const secondAdmin = makeUser(company.id, UserRole.ADMIN);
    const deleteUser = new DeleteUserUseCase(
      transactionManager,
      userRepository,
    );

    await companyRepository.create(company);
    await userRepository.create(firstAdmin);
    await userRepository.create(secondAdmin);

    const results = await Promise.allSettled([
      deleteUser.execute({ id: firstAdmin.id }),
      deleteUser.execute({ id: secondAdmin.id }),
    ]);

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    const activeAdmins = await prisma.user.count({
      where: {
        companyId: company.id,
        role: UserRole.ADMIN,
        active: true,
        deletedAt: null,
      },
    });

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toMatchObject({ reason: expect.any(ForbiddenError) });
    expect(activeAdmins).toBe(1);
  });
});
