import type { PrismaClient } from "@prisma/client";

export const PRISMA_CLIENT = Symbol("PRISMA_CLIENT");

export type PrismaConnection = Pick<PrismaClient, "$queryRaw" | "$disconnect">;
