import { Prisma, PrismaClient } from '@prisma/client';
import {
  TransactionManager,
  TransactionContext,
  TransactionOptions,
} from '@/modules/@shared/domain/transaction/transaction-manager.interface';

export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaClient) {}

  async execute<T>(
    fn: (trx: TransactionContext) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    const prismaOptions = options?.isolationLevel
      ? { isolationLevel: Prisma.TransactionIsolationLevel[options.isolationLevel] }
      : undefined;
    return this.prisma.$transaction(async (tx) => fn(tx), prismaOptions);
  }
}
