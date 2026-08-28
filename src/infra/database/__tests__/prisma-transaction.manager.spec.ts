import { Prisma, type PrismaClient } from "@prisma/client";
import { PrismaTransactionContext } from "../prisma-transaction.context";
import { PrismaTransactionManager } from "../prisma-transaction.manager";

describe("PrismaTransactionManager", () => {
  const transactionClient = { user: {} } as Prisma.TransactionClient;

  it("wraps Prisma's client in an opaque transaction context", async () => {
    const transaction = jest.fn(
      async (callback: (client: Prisma.TransactionClient) => Promise<string>) =>
        callback(transactionClient),
    );
    const manager = new PrismaTransactionManager({
      $transaction: transaction,
    } as unknown as PrismaClient);

    const result = await manager.execute(async (context) => {
      expect(context).toBeInstanceOf(PrismaTransactionContext);
      expect((context as PrismaTransactionContext).client).toBe(
        transactionClient,
      );
      return "committed";
    });

    expect(result).toBe("committed");
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), undefined);
  });

  it("maps the core isolation level to Prisma", async () => {
    const transaction = jest.fn(
      async (
        callback: (client: Prisma.TransactionClient) => Promise<void>,
        _options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
      ) => callback(transactionClient),
    );
    const manager = new PrismaTransactionManager({
      $transaction: transaction,
    } as unknown as PrismaClient);

    await manager.execute(async () => undefined, {
      isolationLevel: "Serializable",
    });

    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });
});
