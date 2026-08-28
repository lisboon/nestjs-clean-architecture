import type { Company as CompanyModel } from "@prisma/client";
import { Company } from "../domain/company.entity";

export class CompanyModelMapper {
  static toEntity(data: CompanyModel): Company {
    return new Company({
      id: data.id,
      name: data.name,
      slug: data.slug,
      active: data.active,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt ?? undefined,
    });
  }
}
