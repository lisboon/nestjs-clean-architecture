import { Prisma } from "@prisma/client";
import { isUniqueConstraintViolation } from "../prisma-error.inspector";

describe("Prisma error inspector", () => {
  it("matches a unique constraint by its Prisma target", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: { target: ["email"] },
      },
    );

    expect(isUniqueConstraintViolation(error, "email")).toBe(true);
    expect(isUniqueConstraintViolation(error, "slug")).toBe(false);
  });

  it("reads constraint fields preserved in driver adapter metadata", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: {
          driverAdapterError: {
            name: "DriverAdapterError",
            cause: {
              kind: "UniqueConstraintViolation",
              constraint: { fields: ["slug"] },
            },
          },
        },
      },
    );

    expect(isUniqueConstraintViolation(error, "slug")).toBe(true);
  });

  it("does not classify unrelated Prisma errors as unique violations", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Foreign key constraint failed",
      {
        code: "P2003",
        clientVersion: "7.10.0",
      },
    );

    expect(isUniqueConstraintViolation(error, "email")).toBe(false);
  });
});
