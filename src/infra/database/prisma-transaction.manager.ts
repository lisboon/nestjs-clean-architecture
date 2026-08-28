import { Prisma, PrismaClient } from "@prisma/client";
import {
  TransactionManager,
  TransactionContext,
  TransactionOptions,
} from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import { PrismaTransactionContext } from "./prisma-transaction.context";
import { isTransactionWriteConflict } from "./prisma-error.inspector";

interface PrismaTransactionManagerOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

export class PrismaTransactionManager implements TransactionManager {
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(
    private readonly prisma: PrismaClient,
    options: PrismaTransactionManagerOptions = {},
  ) {
    this.maxRetries = this.normalizeOption(options.maxRetries, 2, true);
    this.retryDelayMs = this.normalizeOption(options.retryDelayMs, 25);
  }

  async execute<T>(
    fn: (trx: TransactionContext) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    const prismaOptions = options?.isolationLevel
      ? {
          isolationLevel:
            Prisma.TransactionIsolationLevel[options.isolationLevel],
        }
      : undefined;
    let retry = 0;

    while (true) {
      try {
        return await this.prisma.$transaction(
          async (tx) => fn(new PrismaTransactionContext(tx)),
          prismaOptions,
        );
      } catch (error) {
        if (!isTransactionWriteConflict(error) || retry >= this.maxRetries) {
          throw error;
        }

        await this.wait(this.retryDelayMs * 2 ** retry);
        retry += 1;
      }
    }
  }

  private async wait(delayMs: number): Promise<void> {
    if (delayMs === 0) return;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  private normalizeOption(
    value: number | undefined,
    fallback: number,
    integer = false,
  ): number {
    if (value === undefined) return fallback;
    if (!Number.isFinite(value)) return fallback;
    const normalized = Math.max(0, value);
    return integer ? Math.trunc(normalized) : normalized;
  }
}
