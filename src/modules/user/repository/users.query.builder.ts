import type { EUserRole, Prisma } from "@prisma/client";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { UserFilter } from "../gateway/user.filter";

export interface UsersQuery {
  where: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
  skip: number;
  take: number;
}

const SORTABLE_FIELDS = ["name", "email", "role", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

export default class UsersQueryBuilder {
  constructor(private readonly params: SearchParams<UserFilter>) {}

  build(): UsersQuery {
    const filter = this.params.filter ?? {};
    const where: Prisma.UserWhereInput = {};

    if (filter.role !== undefined) {
      where.role = filter.role as EUserRole;
    }
    if (filter.active !== undefined) {
      where.active = filter.active;
    }
    if (filter.name) {
      where.name = { contains: filter.name };
    }
    if (filter.email) {
      where.email = { contains: filter.email };
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
