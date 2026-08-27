import type { Prisma } from "@prisma/client";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { CompanyFilter } from "../gateway/company.filter";

export interface CompaniesQuery {
  where: Prisma.CompanyWhereInput;
  orderBy?: Prisma.CompanyOrderByWithRelationInput;
  skip: number;
  take: number;
}

const SORTABLE_FIELDS = ["name", "slug", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

export default class CompaniesQueryBuilder {
  constructor(private readonly params: SearchParams<CompanyFilter>) {}

  build(): CompaniesQuery {
    const filter = this.params.filter ?? {};
    const where: Prisma.CompanyWhereInput = {};

    if (filter.active !== undefined) {
      where.active = filter.active;
    }
    if (filter.name) {
      where.name = { contains: filter.name };
    }
    if (filter.slug) {
      where.slug = { contains: filter.slug };
    }

    return {
      where,
      ...(this.isSortableField(this.params.sort) && {
        orderBy: {
          [this.params.sort]: this.params.sortDir ?? "asc",
        },
      }),
      skip: (this.params.page - 1) * this.params.perPage,
      take: this.params.perPage,
    };
  }

  private isSortableField(value: string | null): value is SortableField {
    return SORTABLE_FIELDS.some((field) => field === value);
  }
}
