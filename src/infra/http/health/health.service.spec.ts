import { ServiceUnavailableException } from "@nestjs/common";
import { PrismaConnection } from "@/infra/database/prisma.provider";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  const prisma = {
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
  } as unknown as jest.Mocked<PrismaConnection>;

  const service = new HealthService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reports the process as live without querying the database", () => {
    expect(service.live()).toEqual({ status: "up" });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("reports readiness when the database responds", async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    await expect(service.ready()).resolves.toEqual({
      status: "up",
      checks: { database: "up" },
    });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("reports service unavailable without leaking the database error", async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error("connection refused"));

    await expect(service.ready()).rejects.toMatchObject({
      constructor: ServiceUnavailableException,
      response: {
        status: "down",
        checks: { database: "down" },
      },
    });
  });
});
