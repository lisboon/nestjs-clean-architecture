import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  PRISMA_CLIENT,
  PrismaConnection,
} from "@/infra/database/prisma.provider";

export interface LivenessStatus {
  status: "up";
}

export interface ReadinessStatus extends LivenessStatus {
  checks: {
    database: "up";
  };
}

@Injectable()
export class HealthService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaConnection,
  ) {}

  live(): LivenessStatus {
    return { status: "up" };
  }

  async ready(): Promise<ReadinessStatus> {
    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
      return { status: "up", checks: { database: "up" } };
    } catch {
      throw new ServiceUnavailableException({
        status: "down",
        checks: { database: "down" },
      });
    }
  }
}
