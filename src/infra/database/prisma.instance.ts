import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const isCli =
  process.env.npm_lifecycle_event === 'cli' || process.env.npm_lifecycle_event === 'command';

const isProduction = process.env.NODE_ENV === 'production';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: isCli || isProduction ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});

export default prisma;
