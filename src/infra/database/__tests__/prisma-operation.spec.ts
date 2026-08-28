import { Prisma } from "@prisma/client";
import { executeWithUniqueConstraintTranslation } from "../prisma-operation";

const uniqueEmailError = () =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "7.10.0",
    meta: { target: ["email"] },
  });

describe("executeWithUniqueConstraintTranslation", () => {
  it("returns the operation result", async () => {
    await expect(
      executeWithUniqueConstraintTranslation(
        async () => "persisted",
        "email",
        () => new Error("Email already in use"),
      ),
    ).resolves.toBe("persisted");
  });

  it("translates a matching unique constraint", async () => {
    const translatedError = new Error("Email already in use");

    await expect(
      executeWithUniqueConstraintTranslation(
        async () => {
          throw uniqueEmailError();
        },
        "email",
        () => translatedError,
      ),
    ).rejects.toBe(translatedError);
  });

  it("preserves errors for other constraints", async () => {
    const originalError = uniqueEmailError();

    await expect(
      executeWithUniqueConstraintTranslation(
        async () => {
          throw originalError;
        },
        "slug",
        () => new Error("Slug already in use"),
      ),
    ).rejects.toBe(originalError);
  });
});
