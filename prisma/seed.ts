import 'dotenv/config';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DEFAULT_SALT_ROUNDS = 12;

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Administrador';

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required to seed the first admin.',
    );
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`Seed: admin "${email}" already exists, nothing to do.`);
      return;
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? DEFAULT_SALT_ROUNDS);
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        password: await bcrypt.hash(password, rounds),
        role: 'ADMIN',
      },
    });
    console.log(`Seed: admin "${email}" created.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
