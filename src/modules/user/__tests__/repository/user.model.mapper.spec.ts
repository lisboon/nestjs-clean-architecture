import { EUserRole, type User as UserModel } from "@prisma/client";
import { UserRole } from "@/modules/@shared/domain/enums";
import { UserModelMapper } from "../../repository/user.model.mapper";

describe("UserModelMapper", () => {
  it("maps every persisted field to the domain entity", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");
    const tokenValidAfter = new Date("2026-01-03T00:00:00.000Z");
    const row: UserModel = {
      id: "user-id",
      name: "Wendel Lisboa",
      email: "wendel@example.com",
      password: "password-hash",
      role: EUserRole.ADMIN,
      companyId: "company-id",
      avatarUrl: "https://example.com/avatar.png",
      tokenValidAfter,
      active: true,
      createdAt,
      updatedAt,
      deletedAt: null,
    };

    const entity = UserModelMapper.toEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: UserRole.ADMIN,
      companyId: row.companyId,
      avatarUrl: row.avatarUrl,
      tokenValidAfter,
      active: true,
      createdAt,
      updatedAt,
      deletedAt: undefined,
    });
  });

  it("maps nullable persistence fields to absent domain values", () => {
    const timestamp = new Date("2026-01-01T00:00:00.000Z");
    const row: UserModel = {
      id: "user-id",
      name: "User",
      email: "user@example.com",
      password: "password-hash",
      role: EUserRole.USER,
      companyId: "company-id",
      avatarUrl: null,
      tokenValidAfter: null,
      active: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: timestamp,
    };

    const entity = UserModelMapper.toEntity(row);

    expect(entity.avatarUrl).toBeUndefined();
    expect(entity.tokenValidAfter).toBeUndefined();
    expect(entity.deletedAt).toBe(timestamp);
  });
});
