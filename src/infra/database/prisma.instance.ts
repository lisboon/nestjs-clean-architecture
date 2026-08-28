import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadApplicationConfig } from "@/infra/config/application.config";

const config = loadApplicationConfig();

const isCli =
  process.env.npm_lifecycle_event === "cli" ||
  process.env.npm_lifecycle_event === "command";

const isProduction = config.nodeEnv === "production";
const isTest = config.nodeEnv === "test";

const getLogLevels = (): Prisma.LogLevel[] => {
  if (isTest) return [];
  if (isCli || isProduction) return ["warn", "error"];
  return ["query", "info", "warn", "error"];
};

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
  log: getLogLevels(),
});

export default prisma;
