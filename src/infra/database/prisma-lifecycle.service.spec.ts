import { PrismaLifecycleService } from "./prisma-lifecycle.service";
import { PrismaConnection } from "./prisma.provider";

describe("PrismaLifecycleService", () => {
  it("disconnects Prisma when the application shuts down", async () => {
    const prisma = {
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as unknown as PrismaConnection;
    const service = new PrismaLifecycleService(prisma);

    await service.onApplicationShutdown();

    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
  });
});
