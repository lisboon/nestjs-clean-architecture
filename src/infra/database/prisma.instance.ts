import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const isCli =
  process.env.npm_lifecycle_event === "cli" ||
  process.env.npm_lifecycle_event === "command";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const getLogLevels = (): Prisma.LogLevel[] => {
  if (isTest) return [];
  if (isCli || isProduction) return ["warn", "error"];
  return ["query", "info", "warn", "error"];
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: getLogLevels(),
});

export default prisma;
