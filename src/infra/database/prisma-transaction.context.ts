import type { Prisma, PrismaClient } from "@prisma/client";
import { TransactionContext } from "@/modules/@shared/domain/transaction/transaction-manager.interface";

export class PrismaTransactionContext extends TransactionContext {
  constructor(readonly client: Prisma.TransactionClient) {
    super();
  }
}

export type PrismaRepositoryClient = PrismaClient | Prisma.TransactionClient;

export const resolvePrismaClient = (
  prisma: PrismaClient,
  context?: TransactionContext,
): PrismaRepositoryClient => {
  if (!context) return prisma;
  if (context instanceof PrismaTransactionContext) return context.client;
  throw new Error("Unsupported transaction context");
};
