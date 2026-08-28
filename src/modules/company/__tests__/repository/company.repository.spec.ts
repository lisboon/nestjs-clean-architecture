import type { Prisma, PrismaClient } from "@prisma/client";
import { PrismaTransactionContext } from "@/infra/database/prisma-transaction.context";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import CompanyRepository from "../../repository/company.repository";

describe("CompanyRepository", () => {
  it("uses the transaction client for both paginated search queries", async () => {
    const defaultFindMany = jest.fn();
    const defaultCount = jest.fn();
    const transactionFindMany = jest.fn().mockResolvedValue([]);
    const transactionCount = jest.fn().mockResolvedValue(0);
    const prisma = {
      company: { findMany: defaultFindMany, count: defaultCount },
    } as unknown as PrismaClient;
    const transactionClient = {
      company: { findMany: transactionFindMany, count: transactionCount },
    } as unknown as Prisma.TransactionClient;
    const repository = new CompanyRepository(prisma);

    const result = await repository.search(
      new SearchParams({}),
      new PrismaTransactionContext(transactionClient),
    );

    expect(result.total).toBe(0);
    expect(transactionFindMany).toHaveBeenCalledTimes(1);
    expect(transactionCount).toHaveBeenCalledTimes(1);
    expect(defaultFindMany).not.toHaveBeenCalled();
    expect(defaultCount).not.toHaveBeenCalled();
  });
});
