import type { Prisma, PrismaClient } from "@prisma/client";
import { TransactionContext } from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import {
  PrismaTransactionContext,
  resolvePrismaClient,
} from "../prisma-transaction.context";

class UnsupportedTransactionContext extends TransactionContext {
  constructor() {
    super();
  }
}

describe("resolvePrismaClient", () => {
  const prisma = { user: {} } as PrismaClient;
  const transactionClient = { user: {} } as Prisma.TransactionClient;

  it("returns the default client without a transaction context", () => {
    expect(resolvePrismaClient(prisma)).toBe(prisma);
  });

  it("unwraps a supported Prisma transaction context", () => {
    const context = new PrismaTransactionContext(transactionClient);

    expect(resolvePrismaClient(prisma, context)).toBe(transactionClient);
  });

  it("rejects a transaction context from another adapter", () => {
    expect(() =>
      resolvePrismaClient(prisma, new UnsupportedTransactionContext()),
    ).toThrow("Unsupported transaction context");
  });
});
