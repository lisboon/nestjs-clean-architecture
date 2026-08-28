import type { Company as CompanyModel } from "@prisma/client";
import { CompanyModelMapper } from "../../repository/company.model.mapper";

describe("CompanyModelMapper", () => {
  it("maps every persisted field to the domain entity", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");
    const row: CompanyModel = {
      id: "company-id",
      name: "Acme",
      slug: "acme",
      active: true,
      createdAt,
      updatedAt,
      deletedAt: null,
    };

    const entity = CompanyModelMapper.toEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      name: row.name,
      slug: row.slug,
      active: true,
      createdAt,
      updatedAt,
      deletedAt: undefined,
    });
  });

  it("preserves a soft-deletion timestamp", () => {
    const timestamp = new Date("2026-01-01T00:00:00.000Z");
    const row: CompanyModel = {
      id: "company-id",
      name: "Acme",
      slug: "acme",
      active: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: timestamp,
    };

    expect(CompanyModelMapper.toEntity(row).deletedAt).toBe(timestamp);
  });
});
