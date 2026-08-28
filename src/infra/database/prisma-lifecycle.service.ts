import { Inject, Injectable, OnApplicationShutdown } from "@nestjs/common";
import { PRISMA_CLIENT, PrismaConnection } from "./prisma.provider";

@Injectable()
export class PrismaLifecycleService implements OnApplicationShutdown {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaConnection,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
