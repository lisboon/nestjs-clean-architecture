import DeleteCompanyUseCase from "../../../usecase/delete-company/delete-company.usecase";
import { Company } from "../../../domain/company.entity";
import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";

const makeCompany = () =>
  Company.create({ name: "Acme Corp", slug: "acme-corp" });

const makeSut = ({ company = makeCompany(), activeUsers = 0 } = {}) => {
  const transactionContext = {};
  const transactionManager = {
    execute: jest
      .fn()
      .mockImplementation(async (fn: any) => fn(transactionContext)),
  };
  const companyGateway = {
    findById: jest.fn().mockResolvedValue(company),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const userGateway = {
    countActiveByCompany: jest.fn().mockResolvedValue(activeUsers),
  };

  const useCase = new DeleteCompanyUseCase(
    transactionManager as any,
    companyGateway as any,
    userGateway as any,
  );

  return {
    useCase,
    company,
    transactionContext,
    transactionManager,
    companyGateway,
    userGateway,
  };
};

describe("DeleteCompanyUseCase", () => {
  it("soft deletes a company with no active users inside a serializable transaction", async () => {
    const {
      useCase,
      company,
      transactionContext,
      transactionManager,
      companyGateway,
      userGateway,
    } = makeSut();

    const output = await useCase.execute({ id: company.id });

    expect(transactionManager.execute).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" },
    );
    expect(userGateway.countActiveByCompany).toHaveBeenCalledWith(
      company.id,
      transactionContext,
    );
    expect(companyGateway.findById).toHaveBeenCalledWith(
      company.id,
      transactionContext,
    );
    expect(companyGateway.update).toHaveBeenCalledWith(
      company,
      transactionContext,
    );
    expect(company.deletedAt).toBeInstanceOf(Date);
    expect(company.active).toBe(false);
    expect(output).toEqual({ id: company.id, deletedAt: company.deletedAt });
  });

  it("throws ForbiddenError when the company still has active users", async () => {
    const { useCase, company, companyGateway } = makeSut({ activeUsers: 3 });

    await expect(useCase.execute({ id: company.id })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(companyGateway.update).not.toHaveBeenCalled();
    expect(company.deletedAt).toBeUndefined();
  });

  it("throws NotFoundError when the company does not exist", async () => {
    const { useCase, companyGateway } = makeSut();
    companyGateway.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: "b7e6a1c0-0000-4000-8000-000000000000" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
